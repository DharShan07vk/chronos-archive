import React from "react";
import { cn } from "@/lib/utils";

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "accent" | "outline";
  fullWidth?: boolean;
}

const BrutalistButton: React.FC<BrutalistButtonProps> = ({
  children,
  className,
  variant = "default",
  fullWidth = false,
  ...props
}) => {
  const base = "font-heading uppercase text-lg tracking-wider border-2 border-foreground px-6 py-3 transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

  const variants = {
    default: "bg-foreground text-background hover:bg-accent hover:border-accent brutalist-shadow",
    accent: "bg-accent text-accent-foreground hover:bg-foreground hover:text-background brutalist-shadow-accent",
    outline: "bg-transparent text-foreground hover:bg-foreground hover:text-background brutalist-shadow",
  };

  return (
    <button
      className={cn(base, variants[variant], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default BrutalistButton;
