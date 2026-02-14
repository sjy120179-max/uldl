"use client"

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "secondary";
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ children, variant = "default", className, ...props }, ref) => {
    const glowRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const glow = glowRef.current;
      if (!glow) return;

      const onMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        glow.style.transform = `translate(-${50 - (x - 50) / 5}%, -${50 - (y - 50) / 5}%)`;
      };

      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    }, []);

    const glowGradient = variant === "default"
      ? "from-indigo-500 via-purple-500 to-blue-500"
      : "from-purple-500 via-pink-500 to-violet-500";

    return (
      <>
        <style>{`
          @keyframes subtlePulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.6; }
          }
        `}</style>

        <div className="relative inline-flex items-center justify-center group">
          <div
            ref={glowRef}
            className={cn(
              "pointer-events-none absolute w-[200%] h-[200%] rounded-full blur-3xl opacity-40",
              "bg-gradient-to-r",
              glowGradient
            )}
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              transition: "transform 150ms ease-out",
              animation: "subtlePulse 6s ease-in-out infinite",
            }}
          />

          <button
            ref={ref}
            className={cn(
              "relative inline-flex items-center justify-center gap-2",
              "rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white",
              "backdrop-blur-md",
              "transition-all duration-300",
              "hover:bg-white/20",
              "focus:outline-none focus:ring-2 focus:ring-white/40",
              className
            )}
            {...props}
          >
            {children}
          </button>
        </div>
      </>
    );
  }
);

GlowButton.displayName = "GlowButton";
