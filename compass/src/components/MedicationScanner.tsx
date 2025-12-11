import { useEffect, useMemo, useId } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, Loader2, Info, Volume2, Pill, ScanEye } from 'lucide-react';
import { useCameraStream } from '../hooks/useCameraStream';
import { useMedicationScanner } from '../hooks/useMedicationScanner';
import { CameraState, ScannerState, ScannerMode } from '../../types';
import type { MedicationData } from '../../types';

interface MedicationScannerProps {
  onSave?: (data: MedicationData) => void;
  lockMode?: boolean;
  defaultMode?: ScannerMode;
}

export const MedicationScanner = ({ onSave, lockMode = false, defaultMode = ScannerMode.MEDICATION }: MedicationScannerProps) => {
  const frequencySelectId = useId();
  const { videoRef, cameraState, activeStream, startCamera, stopCamera } = useCameraStream();
  const {
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
  } = useMedicationScanner(videoRef);

  // Initialize mode and camera
  useEffect(() => {
    setMode(defaultMode);
    startCamera();
    setScannerState(ScannerState.SCANNING);
    return () => {
      stopCamera();
    };
  }, [defaultMode, setMode, setScannerState, startCamera, stopCamera]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !activeStream || scannerState !== ScannerState.SCANNING) return;

    if (videoEl.srcObject !== activeStream) {
      videoEl.srcObject = activeStream;
    }

    // Only attempt to play if video is paused to avoid interrupting existing playback
    if (!videoEl.paused) return;

    const playSafe = async () => {
      try {
        await videoEl.play();
      } catch (err) {
        // Ignore AbortError which is common when streams change or components unmount
        const error = err as Error;
        if (error.name === 'AbortError' || error.message?.includes('interrupted')) {
          return;
        }
        console.error('Video play error:', err);
      }
    };

    playSafe();
  }, [videoRef, activeStream, scannerState]);

  const isFormValid = useMemo(
    () => !!(scannedData?.medication_name && scannedData?.dosage && scannedData?.frequency && scannedData?.purpose),
    [scannedData]
  );

  // CAMERA STATES
  if (cameraState === CameraState.REQUESTING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <h2 className="text-2xl font-semibold text-primary">Waking up camera...</h2>
        <p className="mt-4 text-xl text-foreground">Please wait a moment while we get ready.</p>
      </div>
    );
  }

  if (cameraState === CameraState.DENIED) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
        <div className="bg-warning p-8 rounded-2xl shadow-sm border border-warning max-w-md w-full">
          <div className="flex justify-center mb-6">
            <Camera className="w-16 h-16 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Camera Access Needed</h2>
          <p className="text-xl text-foreground mb-8 leading-relaxed">
            We need the camera to see the medicine bottle. It looks like access was blocked.
            Please allow access to continue.
          </p>
          <button
            type="button"
            onClick={() => startCamera()}
            className="w-full h-20 bg-primary text-primary-foreground text-xl font-bold rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <RefreshCw className="w-8 h-8" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ANALYZING STATE
  if (scannerState === ScannerState.ANALYZING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 animate-pulse z-0" />
        <div className="z-10 bg-card p-8 rounded-2xl shadow-lg border border-primary/20 max-w-md w-full">
          <Loader2 className="w-20 h-20 text-primary animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-primary mb-2">
            {mode === ScannerMode.MEDICATION ? 'Reading Label...' : 'Looking Closely...'}
          </h2>
          <p className="text-xl text-foreground/80">
            {mode === ScannerMode.MEDICATION ? 'Extracting dosage details.' : "I'm thinking about what this is."}
          </p>
        </div>
      </div>
    );
  }

  // REVIEW STATE - IDENTIFY MODE
  if (scannerState === ScannerState.REVIEW && mode === ScannerMode.IDENTIFY && identificationData) {
    return (
      <div className="flex flex-col min-h-screen bg-background p-6 pt-12">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-inner ${isSpeaking ? 'bg-primary animate-pulse' : 'bg-secondary'}`}>
            <Volume2 className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-6 leading-tight">{identificationData.description}</h2>

          {identificationData.audioBuffer && (
            <button
              type="button"
              onClick={() => playAudio(identificationData.audioBuffer as ArrayBuffer)}
              className="flex items-center gap-3 px-8 py-4 bg-card border-2 border-primary text-primary text-xl font-bold rounded-2xl shadow-sm active:scale-95 transition-transform mb-8"
            >
              <Volume2 className="w-6 h-6" />
              {isSpeaking ? 'Speaking...' : 'Listen Again'}
            </button>
          )}

          {identificationData.is_hazardous && (
            <div className="bg-destructive/10 border border-destructive p-4 rounded-xl mb-8 max-w-sm">
              <p className="text-destructive font-bold">Please be careful with this item.</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={resetScanner}
          className="w-full h-20 bg-primary text-primary-foreground text-2xl font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Identify Another Item
        </button>
      </div>
    );
  }

  // REVIEW STATE - MEDICATION MODE
  if (scannerState === ScannerState.REVIEW && mode === ScannerMode.MEDICATION && scannedData) {
    if (scannedData.is_medication === false) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
          <Info className="w-16 h-16 text-primary mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-3">Not a medication?</h2>
          <p className="text-xl text-foreground/80 mb-8">
            This looks like {scannedData.medication_name}. <br />
            Switch to "Identify Item" mode if you just want to know what things are!
          </p>
          <button
            type="button"
            onClick={resetScanner}
            className="w-full h-16 bg-primary text-primary-foreground font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background p-4 pb-32">
        <header className="mb-6 pt-4">
          <h1 className="text-3xl font-bold text-primary mb-2">Check Details</h1>
          <p className="text-xl text-foreground/80">Confirm before saving.</p>
        </header>

        <div className="space-y-6">
          <InputField
            label="Name"
            value={scannedData.medication_name}
            onChange={(v) => setScannedData({ ...scannedData, medication_name: v })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Dosage"
              value={scannedData.dosage}
              onChange={(v) => setScannedData({ ...scannedData, dosage: v })}
            />
            <div className="flex flex-col gap-2">
              <label htmlFor={frequencySelectId} className="text-xl font-semibold text-foreground">
                Frequency
              </label>
              <select
                id={frequencySelectId}
                value={scannedData.frequency}
                onChange={(e) => setScannedData({ ...scannedData, frequency: e.target.value })}
                className={`
                  w-full h-16 px-4 text-xl rounded-xl border-2 bg-card text-foreground
                  focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
                  ${!scannedData.frequency ? 'border-warning bg-warning/10' : 'border-input'}
                `}
              >
                <option value="">Select...</option>
                <option value="Once Daily">Once Daily</option>
                <option value="Twice Daily">Twice Daily</option>
                <option value="Every 8 Hours">Every 8 Hours</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="As Needed">As Needed</option>
              </select>
            </div>
          </div>
          <InputField
            label="Purpose"
            value={scannedData.purpose}
            onChange={(v) => setScannedData({ ...scannedData, purpose: v })}
          />

          {!isFormValid && (
            <div className="flex items-center gap-3 p-4 bg-warning/30 rounded-xl text-foreground/80">
              <AlertCircle className="w-6 h-6 text-warning-foreground" />
              <span className="text-lg">Please fill in the highlighted boxes.</span>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-primary/10">
          <div className="max-w-md mx-auto flex gap-4">
            <button
              type="button"
              onClick={resetScanner}
              className="flex-1 h-20 bg-card border-2 border-primary text-primary text-xl font-bold rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={() => {
                if (isFormValid && scannedData) {
                  onSave?.(scannedData);
                  confirmData();
                }
              }}
              disabled={!isFormValid}
              className={`
                flex-[2] h-20 text-xl font-bold rounded-xl shadow-md flex items-center justify-center gap-3 transition-all
                ${
                  !isFormValid
                    ? 'bg-input text-foreground/50 cursor-not-allowed'
                    : 'bg-primary text-primary-foreground active:scale-95 shadow-lg'
                }
              `}
            >
              <Check className="w-8 h-8" />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETED STATE
  if (scannerState === ScannerState.COMPLETED) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-8 shadow-inner">
          <Check className="w-14 h-14 text-secondary-foreground" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">All Set!</h2>
        <p className="text-xl text-foreground mb-12">The medication has been saved.</p>
        <button
          type="button"
          onClick={() => {
            resetScanner();
            startCamera();
          }}
          className="w-full max-w-sm h-20 bg-primary text-primary-foreground text-xl font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          Scan Another
        </button>
      </div>
    );
  }

  // ACTIVE SCANNING STATE
  return (
    <div className="relative h-screen bg-black overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-6 bg-gradient-to-b from-black/80 to-transparent">
        {!lockMode && (
          <div className="bg-white/20 backdrop-blur-md p-1 rounded-2xl flex max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => setMode(ScannerMode.IDENTIFY)}
              className={`flex-1 py-3 px-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
                mode === ScannerMode.IDENTIFY ? 'bg-secondary text-white shadow-md' : 'text-white/80'
              }`}
            >
              <ScanEye className="w-5 h-5" /> Identify
            </button>
            <button
              type="button"
              onClick={() => setMode(ScannerMode.MEDICATION)}
              className={`flex-1 py-3 px-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
                mode === ScannerMode.MEDICATION ? 'bg-primary text-white shadow-md' : 'text-white/80'
              }`}
            >
              <Pill className="w-5 h-5" /> Medicine
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className={`w-3/4 aspect-[3/4] border-4 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] transition-colors ${
              mode === ScannerMode.MEDICATION ? 'border-primary/60' : 'border-secondary/60'
            }`}
          ></div>
          <p className="absolute top-1/4 mt-20 text-white text-xl font-medium drop-shadow-md text-center px-6">
            {mode === ScannerMode.MEDICATION ? 'Center Label' : 'Show Item'}
          </p>
        </div>
      </div>

      <div className="bg-background/90 backdrop-blur-md p-6 pb-8 rounded-t-3xl border-t border-white/10 relative z-20">
        <button
          type="button"
          onClick={captureAndAnalyze}
          className={`w-full h-24 text-2xl font-bold rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3 ring-4 ${
            mode === ScannerMode.MEDICATION ? 'bg-primary text-white ring-primary/20' : 'bg-secondary text-white ring-secondary/20'
          }`}
        >
          <Camera className="w-8 h-8" />
          {mode === ScannerMode.MEDICATION ? 'Scan Medicine' : 'What is this?'}
        </button>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; value: string; onChange: (val: string) => void; placeholder?: string }> = ({
  label,
  value,
  onChange,
  placeholder,
}) => {
  const isEmpty = value.trim() === '';
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-xl font-semibold text-foreground">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full h-16 px-4 text-xl rounded-xl border-2 bg-card text-foreground
          focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
          placeholder:text-foreground/30
          ${isEmpty ? 'border-warning bg-warning/10' : 'border-input'}
        `}
      />
    </div>
  );
};
