import { useState, useCallback, useRef } from 'react';
import type { MedicationData, IdentificationData } from '../../types';
import { ScannerState, ScannerMode } from '../../types';
import { analyzeMedicationImage, identifyObjectWithThinking, generateSpeech } from '../services/geminiService';

type IdentificationWithAudio = IdentificationData & { audioBuffer?: ArrayBuffer };

export const useMedicationScanner = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [scannerState, setScannerState] = useState<ScannerState>(ScannerState.IDLE);
  const [mode, setMode] = useState<ScannerMode>(ScannerMode.MEDICATION);

  const [scannedData, setScannedData] = useState<MedicationData | null>(null);
  const [identificationData, setIdentificationData] = useState<IdentificationWithAudio | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playAudio = useCallback(async (audioBuffer: ArrayBuffer) => {
    try {
      if (!audioContextRef.current) {
        const AudioContextCtor =
          window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextCtor({ sampleRate: 24000 });
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const int16Data = new Int16Array(audioBuffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
      }

      const audioBufferObj = ctx.createBuffer(1, float32Data.length, 24000);
      audioBufferObj.copyToChannel(float32Data, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBufferObj;
      source.connect(ctx.destination);

      setIsSpeaking(true);
      source.start();
      source.onended = () => setIsSpeaking(false);
    } catch (error) {
      console.error('Audio Playback Error:', error);
      setIsSpeaking(false);
    }
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || scannerState === ScannerState.ANALYZING) return;

    setScannerState(ScannerState.ANALYZING);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.85);

      if (mode === ScannerMode.MEDICATION) {
        const data = await analyzeMedicationImage(base64Image);
        setScannedData(data);
      } else {
        const data = await identifyObjectWithThinking(base64Image);
        const enhanced: IdentificationWithAudio = { ...data };

        if (enhanced.description) {
          const audioBuffer = await generateSpeech(enhanced.description);
          if (audioBuffer) {
            enhanced.audioBuffer = audioBuffer;
            await playAudio(audioBuffer);
          }
        }
        setIdentificationData(enhanced);
      }

      setScannerState(ScannerState.REVIEW);
    } catch (error) {
      console.error('Scanning failed:', error);
      setScannerState(ScannerState.SCANNING);
    }
  }, [videoRef, scannerState, mode, playAudio]);

  const resetScanner = useCallback(() => {
    setScannedData(null);
    setIdentificationData(null);
    setScannerState(ScannerState.SCANNING);
    setIsSpeaking(false);
  }, []);

  const confirmData = useCallback(() => {
    setScannerState(ScannerState.COMPLETED);
  }, []);

  return {
    scannerState,
    setScannerState,
    mode,
    setMode,
    scannedData,
    setScannedData,
    identificationData,
    captureAndAnalyze,
    resetScanner,
    confirmData,
    playAudio,
    isSpeaking,
  };
};