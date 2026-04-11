import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const crimsonButtonVariants = cva(
  "inline-flex items-center justify-center font-body font-bold text-sm tracking-[0.05em] uppercase transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-primary to-primary-container text-primary-foreground shadow-ambient hover:shadow-elevated",
        outline:
          "border border-border text-foreground hover:bg-accent",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-muted",
        danger:
          "bg-destructive text-destructive-foreground hover:shadow-elevated",
      },
      size: {
        default: "px-8 py-4 rounded-lg",
        sm: "px-5 py-2.5 rounded-md text-xs",
        lg: "px-10 py-5 rounded-xl text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface CrimsonButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof crimsonButtonVariants> {}

const CrimsonButton = forwardRef<HTMLButtonElement, CrimsonButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(crimsonButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
CrimsonButton.displayName = "CrimsonButton";

export { CrimsonButton, crimsonButtonVariants };
