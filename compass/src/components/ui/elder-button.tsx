/**
 * ELDER BUTTON COMPONENT
 * Phase 3: Shadcn Integration - Elder Mode Button Wrapper
 * 
 * Wraps Shadcn Button component with Elder Mode requirements:
 * - 80px+ minimum height (h-24 = 96px)
 * - Large text (text-2xl)
 * - Full width by default
 * - High contrast styling
 */

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ElderButtonProps extends ButtonProps {
  // Add any custom props here if needed
}

const ElderButton = React.forwardRef<HTMLButtonElement, ElderButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button 
        ref={ref}
        className={cn(
          "h-24 w-full text-2xl rounded-xl font-bold border-2", // The "Elder" override classes
          // Override any size-based height/width classes with !important-like specificity
          "[&]:!h-24 [&]:!min-h-24 [&]:!w-full",
          className
        )} 
        {...props} 
      />
    )
  }
)
ElderButton.displayName = "ElderButton"

export { ElderButton }
