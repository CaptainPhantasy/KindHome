import { useEffect, useState, useRef } from 'react';
import { Mic, AudioLines, Square, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { AgentState } from '../../types';

const VoiceCoachWidget = () => {
  const { state, lastTranscript, lastAgentResponse, error, connect, disconnect, interrupt } = useVoiceAgent();

  const [showTutorial, setShowTutorial] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const previousState = useRef<AgentState>(AgentState.DISCONNECTED);

  useEffect(() => {
    const seenTutorial = localStorage.getItem('kind_home_tutorial_seen');
    if (!seenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // Show feedback buttons when agent finishes speaking
  useEffect(() => {
    if (previousState.current === AgentState.SPEAKING && state === AgentState.LISTENING) {
      setShowFeedback(true);
    }
    // If user starts speaking again or disconnects, hide feedback
    if (state === AgentState.SPEAKING || state === AgentState.DISCONNECTED) {
      setShowFeedback(false);
    }
    previousState.current = state;
  }, [state]);

  const dismissTutorial = () => {
    localStorage.setItem('kind_home_tutorial_seen', 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    setShowTutorial(true);
  };

  const handleFeedback = (isHelpful: boolean) => {
    console.log('Feedback:', {
      sentiment: isHelpful ? 'Helpful' : 'Not Helpful',
      transcript: lastAgentResponse,
    });
    setShowFeedback(false);
  };

  const handleMainButton = () => {
    if (state === AgentState.DISCONNECTED) {
      connect();
    } else if (state === AgentState.SPEAKING) {
      interrupt();
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    interrupt();
  };

  return (
    <div className="flex flex-col items-center justify-between h-[750px] w-full max-w-lg relative">
      {/* TUTORIAL MODAL OVERLAY */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="bg-card text-card-foreground rounded-3xl shadow-card-depth p-8 max-w-md w-full border border-border" style={{ transform: 'translateZ(15px)' }}>
            <h2 className="text-3xl font-semibold text-primary mb-6">Welcome to Kind Home</h2>

            <div className="space-y-6 text-left">
              <div className="flex items-start gap-4">
                <div className="bg-secondary/20 p-3 rounded-full text-primary mt-1">
                  <Mic size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-xl text-foreground">Tap to Start</h3>
                  <p className="text-muted-foreground text-lg">Tap the large circle to begin our conversation.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-accent/20 p-3 rounded-full text-accent mt-1">
                  <AudioLines size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-xl text-foreground">I'm Listening</h3>
                  <p className="text-muted-foreground text-lg">I will listen when the waves are moving.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-destructive/20 p-3 rounded-full text-destructive mt-1">
                  <Square size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-xl text-foreground">Interrupt Anytime</h3>
                  <p className="text-muted-foreground text-lg">Tap "Stop" or the circle if you need me to stop speaking.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissTutorial}
              className="mt-10 w-full bg-primary text-primary-foreground text-2xl font-medium py-4 rounded-xl hover:bg-primary/90 transition-all shadow-realistic active:scale-95"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* HEADER HELP */}
      {!showTutorial && (
        <button
          type="button"
          onClick={resetTutorial}
          className="absolute top-0 right-0 p-4 text-muted-foreground hover:text-primary transition-all shadow-realistic active:scale-95"
          aria-label="Show Tutorial"
        >
          <Info size={32} />
        </button>
      )}

      {/* TRANSCRIPT AREA */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 w-full px-4 text-center min-h-[160px]">
        {state !== AgentState.DISCONNECTED ? (
          <div className="transition-opacity duration-1000 ease-in-out">
            <p
              className={`text-2xl md:text-3xl font-medium leading-relaxed ${
                lastTranscript ? 'opacity-100' : 'opacity-0'
              } text-foreground`}
            >
              "{lastTranscript}"
            </p>
          </div>
        ) : (
          !error && <p className="text-3xl text-primary font-medium opacity-80">Tap the circle to start</p>
        )}

        {error && (
          <p className="text-2xl text-destructive font-medium mt-4 bg-destructive/10 px-6 py-3 rounded-xl border border-destructive/20">{error}</p>
        )}
      </div>

      {/* MAIN INTERACTION AREA */}
      <div className="relative flex flex-col items-center justify-center my-4">
        {/* Breathing Animation Ring (Visible when speaking) */}
        {state === AgentState.SPEAKING && (
          <div className="absolute inset-0 bg-accent/20 rounded-full breathing-ring -z-10 scale-150 h-72 w-72 blur-xl" />
        )}

        {/* Continuous Gentle Waves (Visible when listening) */}
        {state === AgentState.LISTENING && (
          <>
            {/* Multiple rings with staggered delays for a continuous wave effect */}
            <div className="absolute inset-0 bg-primary/20 ripple-ring -z-10 h-72 w-72" style={{ animationDelay: '0s' }} />
            <div className="absolute inset-0 bg-primary/20 ripple-ring -z-10 h-72 w-72" style={{ animationDelay: '1s' }} />
            <div className="absolute inset-0 bg-primary/20 ripple-ring -z-10 h-72 w-72" style={{ animationDelay: '2s' }} />
          </>
        )}

        {/* Big Button */}
        <button
          type="button"
          onClick={handleMainButton}
          className={`
            relative flex items-center justify-center
            h-64 w-64 rounded-full shadow-realistic transition-all duration-500
            ${state === AgentState.DISCONNECTED ? 'bg-muted text-primary hover:bg-muted/80 shadow-realistic' : ''}
            ${state === AgentState.CONNECTING ? 'bg-muted/50 text-muted-foreground animate-pulse shadow-realistic' : ''}
            ${state === AgentState.LISTENING ? 'bg-card border-8 border-primary/30 text-accent active:scale-95 shadow-realistic' : ''}
            ${state === AgentState.SPEAKING ? 'bg-accent text-accent-foreground shadow-realistic scale-105 active:scale-95' : ''}
          `}
          aria-label={state === AgentState.SPEAKING ? 'Interrupt' : 'Start Listening'}
        >
          {state === AgentState.DISCONNECTED && <Mic size={80} strokeWidth={1.5} />}
          {state === AgentState.CONNECTING && <Mic size={80} strokeWidth={1.5} className="opacity-50" />}
          {state === AgentState.LISTENING && <Mic size={80} strokeWidth={2} className="text-accent/80" />}
          {state === AgentState.SPEAKING && <AudioLines size={80} strokeWidth={2} className="animate-bounce" />}
        </button>
      </div>

      {/* FEEDBACK & CONTROLS AREA */}
      <div className="w-full flex flex-col items-center justify-start space-y-6 pt-6 pb-8 min-h-[220px]">
        {/* Feedback Buttons */}
        {showFeedback && state === AgentState.LISTENING && (
          <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-2">
            <button
              type="button"
              onClick={() => handleFeedback(false)}
              className="flex items-center gap-2 px-8 py-4 bg-muted text-muted-foreground rounded-2xl hover:bg-muted/80 transition-all shadow-realistic active:scale-95"
            >
              <ThumbsDown size={28} />
              <span className="text-lg font-medium">Not Helpful</span>
            </button>
            <button
              type="button"
              onClick={() => handleFeedback(true)}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all shadow-realistic active:scale-95"
            >
              <ThumbsUp size={28} />
              <span className="text-lg font-medium">Helpful</span>
            </button>
          </div>
        )}

        {/* Interrupt Button */}
        {state === AgentState.SPEAKING && (
          <button
            type="button"
            onClick={handleStop}
            className="flex items-center space-x-3 bg-card text-card-foreground border-2 border-destructive/30 px-12 py-5 rounded-full shadow-realistic active:scale-95 transition-all"
          >
            <Square size={24} className="text-destructive fill-current" />
            <span className="text-2xl font-semibold text-destructive uppercase tracking-wide">Stop</span>
          </button>
        )}

        {/* End Session Button */}
        {state !== AgentState.DISCONNECTED && state !== AgentState.SPEAKING && (
          <button
            type="button"
            onClick={() => disconnect()}
            className="mt-4 px-10 py-4 bg-muted text-muted-foreground text-xl font-medium rounded-full hover:bg-muted/80 transition-all shadow-realistic active:scale-95"
          >
            End Session
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceCoachWidget;
