/**
 * CHECK-IN WIDGET
 * Phase 2A.2: "I'm OK" check-in button widget
 * 
 * Features:
 * - Prominent "I'm OK" button in Sage Green (bg-secondary)
 * - Large touch target (minimum 80px height)
 * - Elder-friendly text sizing (text-2xl minimum)
 * - Visual feedback on click
 */

import { Heart, Check } from 'lucide-react';
import { useState } from 'react';

interface CheckInWidgetProps {
  onCheckIn?: () => void;
  lastCheckedIn?: string | null;
}

const CheckInWidget = ({ onCheckIn, lastCheckedIn }: CheckInWidgetProps) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (isSubmitting || isCheckedIn) return;

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual check-in API call
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      
      if (onCheckIn) {
        onCheckIn();
      }
      
      setIsCheckedIn(true);
      
      // Reset after 3 seconds to allow another check-in
      setTimeout(() => {
        setIsCheckedIn(false);
      }, 3000);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLastCheckIn = (timestamp: string | null | undefined): string => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
      <button
        onClick={handleClick}
        disabled={isSubmitting || isCheckedIn}
        className={`
          w-full min-h-20 sm:min-h-24 p-6 sm:p-8 rounded-lg
          flex items-center justify-center gap-3 sm:gap-4
          transition-all duration-200
          active:scale-95
          disabled:opacity-75 disabled:cursor-not-allowed
          ${isCheckedIn
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-secondary text-secondary-foreground hover:opacity-90'
          }
          border-2 border-secondary
          shadow-realistic
        `}
      >
        {isCheckedIn ? (
          <>
            <Check size={40} className="sm:w-12 sm:h-12" strokeWidth={3} />
            <span className="text-2xl sm:text-3xl font-bold">Checked In!</span>
          </>
        ) : (
          <>
            <Heart size={40} className="sm:w-12 sm:h-12" strokeWidth={2.5} fill="currentColor" />
            <span className="text-2xl sm:text-3xl font-bold">I'm OK</span>
          </>
        )}
      </button>
      
      {lastCheckedIn && !isCheckedIn && (
        <p className="text-lg sm:text-xl text-muted-foreground text-center">
          Last checked in: {formatLastCheckIn(lastCheckedIn)}
        </p>
      )}
    </div>
  );
};

export default CheckInWidget;
