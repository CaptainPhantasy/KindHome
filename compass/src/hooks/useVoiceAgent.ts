import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, type LiveServerMessage, Modality } from '@google/genai';
import { AgentState } from '../../types';
import { SYSTEM_INSTRUCTION, VOICE_NAME, GEMINI_MODEL } from '../constants';
import {
  float32ToPCM16,
  uint8ArrayToBase64,
  base64ToUint8Array,
  pcmToAudioBuffer,
  playFeedbackTone,
} from '../utils/audio';

export const useVoiceAgent = () => {
  const [state, setState] = useState<AgentState>(AgentState.DISCONNECTED);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [lastAgentResponse, setLastAgentResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Refs for audio context and session
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  type LiveSession = {
    sendRealtimeInput: (input: { media: { mimeType: string; data: string } }) => void;
    close: () => void;
  };

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Audio playback queue management
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Accumulate agent response text for the current turn
  const currentAgentResponseRef = useRef<string>('');

  // Track if we have played the "turn start" sound for this utterance
  const hasPlayedTurnStartSoundRef = useRef<boolean>(false);

  const interrupt = useCallback(() => {
    // 1. Play feedback sound
    if (outputAudioContextRef.current) {
      playFeedbackTone(outputAudioContextRef.current, 'disconnect');
    }

    // 2. Stop all playing audio
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current.clear();

    // 3. Reset timing
    if (outputAudioContextRef.current) {
      nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
    }

    // Clear state
    currentAgentResponseRef.current = '';
    hasPlayedTurnStartSoundRef.current = false;

    setState(AgentState.LISTENING);
  }, []);

  // Initialization
  const connect = useCallback(async () => {
    try {
      setState(AgentState.CONNECTING);
      setError(null);

      // 1. Setup Audio Contexts
      // Input: 16kHz required by Gemini for best results
      const AudioContextCtor =
        window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        throw new Error('AudioContext is not supported in this browser.');
      }

      inputAudioContextRef.current = new AudioContextCtor({
        sampleRate: 16000,
      });
      // Output: 24kHz usually for TTS
      outputAudioContextRef.current = new AudioContextCtor({
        sampleRate: 24000,
      });

      // 2. Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Initialize Gemini Client
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key not found in environment variables.');
      }
      const ai = new GoogleGenAI({ apiKey });

      // 4. Start Session
      const sessionPromise = ai.live.connect({
        model: GEMINI_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {}, // Enable user transcription
          outputAudioTranscription: {}, // Enable agent transcription for feedback
        },
        callbacks: {
          onopen: () => {
            console.log('Session connected');
            setState(AgentState.LISTENING);

            // Play Connect Sound
            if (outputAudioContextRef.current) {
              playFeedbackTone(outputAudioContextRef.current, 'connect');
            }

            // Start pumping audio
            if (!inputAudioContextRef.current || !streamRef.current) return;

            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = float32ToPCM16(inputData);
              const pcmBytes = new Uint8Array(pcm16.buffer);
              const base64Data = uint8ArrayToBase64(pcmBytes);

              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data,
                  },
                });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);

            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              // If this is the start of a new speaking turn, play a sound
              if (!hasPlayedTurnStartSoundRef.current) {
                playFeedbackTone(outputAudioContextRef.current, 'turnStart');
                hasPlayedTurnStartSoundRef.current = true;
              }

              setState(AgentState.SPEAKING);

              const ctx = outputAudioContextRef.current;
              const pcmBytes = base64ToUint8Array(audioData);
              const buffer = await pcmToAudioBuffer(pcmBytes, ctx, 24000);

              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);

              // Schedule playback
              // Ensure we don't schedule in the past
              const now = ctx.currentTime;
              const startTime = Math.max(nextStartTimeRef.current, now);

              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;

              activeSourcesRef.current.add(source);

              source.onended = () => {
                activeSourcesRef.current.delete(source);
                if (activeSourcesRef.current.size === 0) {
                  // Reset turn start flag for next time
                  hasPlayedTurnStartSoundRef.current = false;
                  // After a short delay, return to listening if no new audio comes
                  setTimeout(() => {
                    if (activeSourcesRef.current.size === 0) {
                      setState((currentState) =>
                        currentState === AgentState.SPEAKING ? AgentState.LISTENING : currentState
                      );
                    }
                  }, 200);
                }
              };
            }

            // Handle Interruption Signal from Server
            if (msg.serverContent?.interrupted) {
              interrupt();
            }

            // Handle User Transcription
            const userTranscript = msg.serverContent?.inputTranscription?.text;
            if (userTranscript) {
              setLastTranscript(userTranscript);
            }

            // Handle Agent Transcription (Output)
            const agentTranscript = msg.serverContent?.outputTranscription?.text;
            if (agentTranscript) {
              currentAgentResponseRef.current += agentTranscript;
            }

            if (msg.serverContent?.turnComplete) {
              setLastAgentResponse(currentAgentResponseRef.current);
              currentAgentResponseRef.current = '';
              hasPlayedTurnStartSoundRef.current = false; // Ensure next turn gets a sound
            }
          },
          onclose: () => {
            console.log('Session closed');
            setState(AgentState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error('Session error:', err);
            setError('Connection lost. Please tap to reconnect.');
            setState(AgentState.DISCONNECTED);
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      console.error(err);
      setError(message);
      setState(AgentState.DISCONNECTED);
    }
  }, [interrupt]);

  const disconnect = useCallback(() => {
    if (outputAudioContextRef.current) {
      try {
        playFeedbackTone(outputAudioContextRef.current, 'disconnect');
      } catch {
        // ignore
      }
    }

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((session) => session.close()).catch(() => {});
      sessionPromiseRef.current = null;
    }

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      for (const track of tracks) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (processorRef.current && inputAudioContextRef.current) {
      processorRef.current.disconnect();
      sourceRef.current?.disconnect();
    }

    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }

    if (outputAudioContextRef.current) {
      // Delay closing output context slightly to let the disconnect sound play
      setTimeout(() => {
        outputAudioContextRef.current?.close();
        outputAudioContextRef.current = null;
      }, 500);
    } else {
      outputAudioContextRef.current = null;
    }

    setState(AgentState.DISCONNECTED);
    setLastTranscript('');
    setLastAgentResponse('');
    currentAgentResponseRef.current = '';
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    lastTranscript,
    lastAgentResponse,
    error,
    connect,
    disconnect,
    interrupt,
  };
};
