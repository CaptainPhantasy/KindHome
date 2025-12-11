/**
 * BIG ACTION CARD
 * Phase 2A.1: High-contrast action card for Elder interface
 * 
 * Features:
 * - Minimum height: 96px (h-24)
 * - Large text: Title text-2xl, Time text-xl
 * - Pending state: bg-card (Creamy)
 * - Completed state: bg-secondary (Sage Green) with checkmark
 * - Full card clickable with active scale animation
 */

import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface BigActionCardProps {
  icon: LucideIcon;
  title: string;
  time: string;
  status: 'pending' | 'completed';
  onClick: () => void;
}

const BigActionCard = ({ icon: Icon, title, time, status, onClick }: BigActionCardProps) => {
  const isCompleted = status === 'completed';

  return (
    <button
      onClick={onClick}
      className={`
        w-full min-h-20 sm:min-h-24 p-4 sm:p-6 rounded-lg
        flex items-center gap-4 sm:gap-6
        transition-all duration-200
        active:scale-95
        ${isCompleted 
          ? 'bg-secondary text-secondary-foreground' 
          : 'bg-card text-card-foreground'
        }
        border border-border
        shadow-sm hover:shadow-md
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0
        ${isCompleted ? 'text-secondary-foreground' : 'text-foreground'}
      `}>
        <Icon size={32} className="sm:w-10 sm:h-10" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-1 text-left min-w-0">
        <h3 className="text-xl sm:text-2xl font-semibold truncate">{title}</h3>
        <p className="text-lg sm:text-xl text-muted-foreground">{time}</p>
      </div>

      {/* Status Indicator */}
      {isCompleted && (
        <div className="flex-shrink-0">
          <Check size={28} className="sm:w-8 sm:h-8" strokeWidth={3} />
        </div>
      )}
    </button>
  );
};

export default BigActionCard;
