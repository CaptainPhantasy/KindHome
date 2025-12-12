/**
 * TINTED CARD COMPONENT
 * Last Updated: 06:08:39 Dec 11, 2025
 * 
 * Purpose: Enforce Rule 2.5 - Correct text colors on tinted backgrounds
 * 
 * Rule 2.5: On status tints (bg-{color}/10):
 * ✅ text-foreground or text-{color}
 * ❌ text-{color}-foreground (only for solid backgrounds)
 * 
 * This component automatically uses text-foreground, preventing errors.
 */

interface TintedCardProps {
  variant: 'accent' | 'success' | 'warning' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

export const TintedCard = ({ variant, children, className = '' }: TintedCardProps) => {
  // Enforces correct pairing: tinted background + text-foreground
  // Using explicit class mapping for Tailwind JIT compatibility
  const variantClasses = {
    accent: 'bg-accent/10 border-accent',
    success: 'bg-success/10 border-success',
    warning: 'bg-warning/10 border-warning',
    destructive: 'bg-destructive/10 border-destructive',
  };
  
  const baseClasses = `${variantClasses[variant]} border rounded-lg p-4 shadow-card-depth`;
  
  return (
    <div className={`${baseClasses} ${className}`} style={{ transform: 'translateZ(15px)' }}>
      <p className="text-foreground">
        {children}
      </p>
    </div>
  );
};

