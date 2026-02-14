'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame
} from "framer-motion";
import { cn } from '@/lib/utils';
import { GlowButton } from '@/components/ui/glow-button';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Arrow Left Icon Component
 */
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

/**
 * Google Icon Component
 */
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/**
 * Helper component for the SVG grid pattern.
 */
const GridPattern = ({ offsetX, offsetY, size }: { offsetX: any; offsetY: any; size: number }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="auth-grid-pattern"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#auth-grid-pattern)" />
    </svg>
  );
};

/**
 * Auth Page Component
 */
export default function AuthPage() {
  const gridSize = 50;
  const containerRef = useRef<HTMLDivElement>(null);
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Track mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  // Grid offsets for infinite scroll animation
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const speedX = 0.5;
  const speedY = 0.5;

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + speedX) % gridSize);
    gridOffsetY.set((currentY + speedY) % gridSize);
  });

  // Create a dynamic radial mask for the "flashlight" effect
  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setIsSigningIn(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-background"
      )}
    >
      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors duration-200 group"
      >
        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="text-sm font-medium">Back</span>
      </Link>

      {/* Layer 1: Subtle background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.08]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </div>

      {/* Layer 2: Highlighted grid (revealed by mouse mask) */}
      <motion.div
        className="absolute inset-0 z-0 opacity-50"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </motion.div>

      {/* Decorative Blur Spheres */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute right-[-25%] top-[-25%] w-[50%] h-[50%] rounded-full bg-orange-500/50 dark:bg-orange-500/35 blur-[120px]" />
        <div className="absolute right-[5%] top-[-15%] w-[30%] h-[30%] rounded-full bg-primary/40 dark:bg-primary/30 blur-[100px]" />
        <div className="absolute left-[-15%] bottom-[-25%] w-[50%] h-[50%] rounded-full bg-blue-500/50 dark:bg-blue-500/35 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg mx-auto space-y-8 pointer-events-none">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/uldl_icon_0.png"
            alt="ULDL Icon"
            width={80}
            height={80}
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground drop-shadow-sm">
            Welcome to ULDL
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Sign in to start sharing files seamlessly
          </p>
        </div>

        {/* Google Sign In Button */}
        <div className="pointer-events-auto">
          <GlowButton
            variant="default"
            className="px-8 py-4"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
          >
            <GoogleIcon className="w-6 h-6" />
            <span className="text-base font-semibold">
              {isSigningIn ? 'Signing in...' : 'Continue with Google'}
            </span>
          </GlowButton>
        </div>

        {/* Error Message */}
        {error && (
          <div className="pointer-events-auto text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Additional Info */}
        <p className="text-sm text-muted-foreground/80 max-w-md">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-4 left-4 z-50 text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 font-mono">
        ULDL v1.0
      </footer>
    </div>
  );
}
