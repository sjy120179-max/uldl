"use client"

import React from "react";
import { cn } from "@/lib/utils";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "secondary";
  wrapperClassName?: string;
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ children, variant = "default", className, wrapperClassName, ...props }, ref) => {
    const isDefault = variant === "default";

    const bg = isDefault
      ? "linear-gradient(135deg, rgba(79,70,229,0.55) 0%, rgba(99,102,241,0.45) 100%)"
      : "linear-gradient(135deg, rgba(126,34,206,0.55) 0%, rgba(168,85,247,0.45) 100%)";

    const border = isDefault
      ? "rgba(99,102,241,0.7)"
      : "rgba(168,85,247,0.7)";

    const shadow = isDefault
      ? "0 0 16px rgba(79,70,229,0.5), 0 0 32px rgba(79,70,229,0.2)"
      : "0 0 16px rgba(147,51,234,0.5), 0 0 32px rgba(147,51,234,0.2)";

    const shadowHover = isDefault
      ? "0 0 24px rgba(79,70,229,0.7), 0 0 48px rgba(79,70,229,0.3)"
      : "0 0 24px rgba(147,51,234,0.7), 0 0 48px rgba(147,51,234,0.3)";

    return (
      <div className={cn("relative inline-flex items-center justify-center", wrapperClassName)}>
        <button
          ref={ref}
          className={cn(
            "relative inline-flex items-center justify-center gap-2",
            "rounded-xl px-6 py-3 text-sm font-medium text-white",
            "transition-all duration-300 active:scale-95",
            "focus:outline-none",
            className
          )}
          style={{
            background: bg,
            border: `1px solid ${border}`,
            boxShadow: shadow,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = shadowHover; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = shadow; }}
          {...props}
        >
          {children}
        </button>
      </div>
    );
  }
);

GlowButton.displayName = "GlowButton";
