/**
 * SOLID CARD COMPONENT
 * Last Updated: 06:08:39 Dec 11, 2025
 * 
 * Purpose: Enforce Rule 2.2-2.5 - Correct text colors on solid backgrounds
 * 
 * Rule 2.2-2.5: On solid bg-{color}:
 * ✅ text-{color}-foreground (always)
 * ❌ text-foreground or text-{color}
 * 
 * This component automatically uses the correct -foreground variant.
 */

interface SolidCardProps {
  variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

export const SolidCard = ({ variant, children, className = '' }: SolidCardProps) => {
  // Enforces correct pairing: solid background + matching foreground
  // Using explicit class mapping for Tailwind JIT compatibility
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };
  
  const baseClasses = `${variantClasses[variant]} rounded-lg p-4`;
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
};

