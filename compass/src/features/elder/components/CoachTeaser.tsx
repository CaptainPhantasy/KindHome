/**
 * COACH TEASER COMPONENT
 * Phase 2A.3: "Ask Kind Home" AI interface stub
 * 
 * Features:
 * - Card container with title
 * - Large text input with voice button (Elder Mode - 80px+ height)
 * - Simple chat interface stub (placeholder messages)
 * - Follows Elder Mode requirements: large touch targets, warm colors
 */

import { useState } from 'react';
import { Mic, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
}

const CoachTeaser = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Kind Home Coach. Ask me anything about your day, medications, or home.",
      sender: 'coach',
      timestamp: new Date(),
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    // TODO: Implement AI chat functionality
    console.log('Sending message:', inputValue);
    setInputValue('');
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input functionality
    console.log('Voice input activated');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="w-full h-full bg-card rounded-lg border border-border p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4 min-h-0 shadow-card-depth" style={{ transform: 'translateZ(15px)' }}>
      {/* Header - Fixed size */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center">
          <Sparkles size={20} className="sm:w-6 sm:h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Ask Kind Home</h2>
          <p className="text-lg sm:text-xl text-muted-foreground">Your daily planning assistant</p>
        </div>
      </div>

      {/* Chat Messages (Stub) - Flexible */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 bg-background rounded-lg border border-border">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} flex-shrink-0`}
          >
            <div
              className={`max-w-[80%] p-3 sm:p-4 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              <p className="text-lg sm:text-xl">{message.text}</p>
            </div>
          </div>
        ))}
        <div className="text-center text-muted-foreground text-base sm:text-lg flex-shrink-0">
          <p>Type or tap the microphone to ask a question...</p>
        </div>
      </div>

      {/* Input Area - Fixed size */}
      <div className="flex gap-2 sm:gap-3 flex-shrink-0">
        {/* Text Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          className="flex-1 h-16 sm:h-20 px-3 sm:px-4 text-xl sm:text-2xl rounded-lg border-2 border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />

        {/* Voice Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center border-2 border-border hover:bg-secondary/80 active:scale-95 transition-all flex-shrink-0 shadow-realistic"
          aria-label="Voice input"
        >
          <Mic size={28} className="sm:w-8 sm:h-8" strokeWidth={2} />
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-primary text-primary-foreground flex items-center justify-center border-2 border-border hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-realistic"
          aria-label="Send message"
        >
          <Send size={28} className="sm:w-8 sm:h-8" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default CoachTeaser;
