import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Loader2, CheckCircle, RotateCcw, AlertCircle, Keyboard, X } from 'lucide-react';
import { useMemoryTidier } from '../hooks/useMemoryTidier';
import type { MemoryRecord } from '../../types';

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: {
    transcript: string;
  };
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  start: () => void;
  stop: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart?: () => void;
  onresult?: (event: SpeechRecognitionEvent) => void;
  onerror?: (event: SpeechRecognitionErrorEvent) => void;
  onend?: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition } | undefined;
    webkitSpeechRecognition: { new (): SpeechRecognition } | undefined;
  }
}

interface MemoryInputWidgetProps {
  onSave: (memory: MemoryRecord) => void;
}

const SILENCE_THRESHOLD_MS = 4000; // 4 seconds of silence triggers auto-save

const MemoryInputWidget = ({ onSave }: MemoryInputWidgetProps) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);

  // Visual feedback for silence timer (optional, but helpful)
  const [silenceSeconds, setSilenceSeconds] = useState(0);

  const [localError, setLocalError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const pollingIntervalRef = useRef<number | null>(null);

  const { tidyMemory, saveMemory: triggerSaveState, reset, status, result, error: aiError } = useMemoryTidier();

  const activeError = localError || aiError;

  // Ref to access current text in the polling closure
  const inputTextRef = useRef(inputText);
  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  // AUTOMATION: Watch for "Review" status and auto-save immediately
  useEffect(() => {
    if (status === 'review' && result) {
      onSave(result);
      triggerSaveState();
      setInputText('');
    }
  }, [status, result, onSave, triggerSaveState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const handleStopAndTidy = useCallback(() => {
    stopListening();

    setTimeout(() => {
      if (inputTextRef.current.trim()) {
        tidyMemory(inputTextRef.current);
      } else {
        setIsListening(false);
      }
    }, 500);
  }, [stopListening, tidyMemory]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) window.clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // POLLING ENGINE for Silence Detection
  useEffect(() => {
    if (isListening) {
      pollingIntervalRef.current = window.setInterval(() => {
        const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;

        setSilenceSeconds(Math.min(timeSinceLastSpeech / 1000, 4));

        if (timeSinceLastSpeech > SILENCE_THRESHOLD_MS) {
          if (inputTextRef.current.trim().length > 0) {
            handleStopAndTidy();
          } else {
            lastSpeechTimeRef.current = Date.now();
          }
        }
      }, 500);
    } else {
      if (pollingIntervalRef.current) window.clearInterval(pollingIntervalRef.current);
      setSilenceSeconds(0);
    }
    return () => {
      if (pollingIntervalRef.current) window.clearInterval(pollingIntervalRef.current);
    };
  }, [handleStopAndTidy, isListening]);

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionCtor) {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setLocalError(null);
        lastSpeechTimeRef.current = Date.now();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        lastSpeechTimeRef.current = Date.now();
        setSilenceSeconds(0);

        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setInputText((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed') {
          setLocalError('Microphone access denied.');
          setIsListening(false);
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setLocalError('Voice not supported.');
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setLocalError('Voice not supported.');
      return;
    }
    setLocalError(null);

    if (isListening) {
      handleStopAndTidy();
    } else {
      try {
        recognitionRef.current.start();
        setInputText('');
      } catch (err) {
        console.error('Mic start error', err);
      }
    }
  };

  const handleReset = () => {
    reset();
    setLocalError(null);
    setInputText('');
  };

  // 1. SUCCESS STATE
  if (status === 'saved') {
    return (
      <div className="h-full bg-card rounded-3xl shadow-card-depth flex flex-col items-center justify-center p-8 animate-fade-in text-center" style={{ transform: 'translateZ(15px)' }}>
        <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center animate-bounce-short mb-6">
          <CheckCircle className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-2">Saved to Vault</h2>
        <p className="text-foreground/60 mb-8">Memory secured safely.</p>

        <button
          type="button"
          onClick={handleReset}
          className="h-16 px-8 bg-background text-foreground hover:bg-primary hover:text-primary-foreground rounded-2xl text-lg font-bold transition-all flex items-center space-x-2 shadow-realistic active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Capture Another</span>
        </button>
      </div>
    );
  }

  // 2. PROCESSING / REVIEW STATE
  if (status === 'processing' || status === 'review') {
    return (
      <div className="h-full bg-card rounded-3xl shadow-card-depth flex flex-col items-center justify-center p-8 animate-fade-in text-center relative overflow-hidden" style={{ transform: 'translateZ(15px)' }}>
        <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>

        <Loader2 className="w-20 h-20 text-primary animate-spin mb-6 relative z-10" />
        <h2 className="text-3xl font-bold text-primary mb-2 relative z-10">Tidying Up...</h2>
        <p className="text-foreground/60 text-lg relative z-10">Organizing your memory into the vault.</p>
      </div>
    );
  }

  // 3. TEXT INPUT MODE (Fallback)
  if (showTextInput && !isListening) {
    return (
      <div className="h-full bg-card rounded-3xl shadow-card-depth flex flex-col overflow-hidden relative transition-all" style={{ transform: 'translateZ(15px)' }}>
        <div className="absolute top-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setShowTextInput(false)}
            className="p-3 bg-background rounded-xl text-foreground hover:bg-background/80 shadow-realistic active:scale-95 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 p-6 flex flex-col space-y-4 animate-fade-in">
          <div className="flex items-center space-x-2 text-primary mb-2">
            <Keyboard className="w-6 h-6" />
            <h2 className="text-xl font-bold">Type a Memory</h2>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your memory here..."
            className="flex-1 w-full bg-background rounded-2xl p-6 text-xl text-foreground placeholder-foreground/40 resize-none focus:outline-none focus:ring-4 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => handleStopAndTidy()}
            disabled={!inputText.trim()}
            className="w-full h-20 bg-accent text-accent-foreground rounded-2xl text-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-realistic active:scale-95"
          >
            Tidy & Save
          </button>
        </div>
      </div>
    );
  }

  // 4. MAIN LISTENING STATE
  return (
    <div className="h-full bg-card rounded-3xl shadow-card-depth flex flex-col overflow-hidden relative transition-all" style={{ transform: 'translateZ(15px)' }}>
      {!isListening && (
        <div className="absolute top-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setShowTextInput(true)}
            className="p-3 bg-background text-foreground rounded-xl hover:bg-background/80 transition-all shadow-realistic active:scale-95"
          >
            <Keyboard className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 relative">
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="w-64 h-64 bg-accent/5 rounded-full animate-ping opacity-75 absolute"></div>
            <div className="w-48 h-48 bg-accent/10 rounded-full animate-ping opacity-75 animation-delay-300 absolute"></div>
          </div>
        )}

        <div className="text-center z-10 space-y-2">
          <h2 className="text-3xl font-bold text-primary">{isListening ? "I'm Listening..." : 'Capture a Memory'}</h2>
          <p className="text-foreground/60 text-lg transition-all duration-300">
            {isListening ? (silenceSeconds > 1.5 ? 'Quiet detected... finishing soon.' : 'Speak freely.') : 'Tap the microphone to start'}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleListening}
          className={`
            relative z-20 h-48 w-48 rounded-full flex items-center justify-center transition-all duration-300 shadow-realistic active:scale-95
            ${isListening ? 'bg-accent scale-110' : 'bg-primary hover:bg-opacity-90 hover:scale-105'}
          `}
        >
          {isListening ? (
            <Mic className="w-20 h-20 text-accent-foreground animate-bounce-short" />
          ) : (
            <Mic className="w-20 h-20 text-primary-foreground" />
          )}

          {isListening && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              role="presentation"
              aria-hidden="true"
              focusable="false"
            >
              <circle className="text-white/20" strokeWidth="4" stroke="currentColor" fill="transparent" r="48" cx="50" cy="50" />
              <circle
                className="text-white transition-all duration-500 ease-linear"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={(2 * Math.PI * 48) * (1 - silenceSeconds / (SILENCE_THRESHOLD_MS / 1000))}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="48"
                cx="50"
                cy="50"
              />
            </svg>
          )}
        </button>

        <div className="h-8">
          {isListening && silenceSeconds > 0.5 && (
            <span className="text-accent font-medium text-sm animate-pulse">Auto-saving in {Math.ceil(4 - silenceSeconds)}s...</span>
          )}
        </div>

        {activeError && (
          <div className="absolute bottom-12 bg-destructive/80 backdrop-blur-sm text-destructive-foreground px-6 py-3 rounded-2xl flex items-center space-x-3 animate-fade-in z-30 shadow-realistic border border-destructive max-w-[80%]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-base font-medium text-left">{activeError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryInputWidget;
