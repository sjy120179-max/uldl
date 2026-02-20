'use client';

import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame
} from "framer-motion";
import { cn } from '@/lib/utils';
import { GlowButton } from '@/components/ui/glow-button';
import { UploadModal } from '@/components/modals/upload-modal';
import { DownloadModal } from '@/components/modals/download-modal';
import { FileDisplayModal } from '@/components/modals/file-display-modal';

/**
 * Custom SVG Icons
 */
const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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
          id="grid-pattern"
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
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};

/**
 * The Infinite Grid Component
 * Displays a scrolling background grid that reveals an active layer on mouse hover.
 */
export const Hero = () => {
  const gridSize = 50; // Fixed grid size
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isFileDisplayModalOpen, setIsFileDisplayModalOpen] = useState(false);
  const [fileData, setFileData] = useState<any>(null);

  // Track mouse position with Motion Values for performance (avoids React re-renders)
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
    // Reset offset at pattern width to simulate infinity
    gridOffsetX.set((currentX + speedX) % gridSize);
    gridOffsetY.set((currentY + speedY) % gridSize);
  });

  // Create a dynamic radial mask for the "flashlight" effect
  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  const handleCodeSubmit = async (code: string) => {
    try {
      const response = await fetch(`/api/anonymous-download?code=${code}`);

      if (!response.ok) {
        alert('Invalid code or file not found');
        return;
      }

      const data = await response.json();
      setFileData(data);
      setIsDownloadModalOpen(false);
      setIsFileDisplayModalOpen(true);
    } catch (error) {
      console.error('Error fetching file:', error);
      alert('Failed to fetch file');
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-background"
      )}
    >
      {/* Layer 1: Subtle background grid (always visible) */}
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
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto space-y-8 pointer-events-none">
         <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground drop-shadow-sm">
            Upload Anything,<br />Download Anything
          </h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground">
            Simple. Fast. Anywhere.
          </p>
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            Share files, images, and text seamlessly across devices. <br className="hidden md:block" />
            No registration needed. Just drag, drop, and share.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
          <GlowButton variant="default" onClick={() => setIsUploadModalOpen(true)}>
            <UploadIcon className="w-5 h-5" />
            Upload
          </GlowButton>

          <GlowButton variant="secondary" onClick={() => setIsDownloadModalOpen(true)}>
            <DownloadIcon className="w-5 h-5" />
            Download
          </GlowButton>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-4 left-4 z-50 text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 font-mono">
        AnyDrop v1.0
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onCodeSubmit={handleCodeSubmit}
      />
      <FileDisplayModal
        isOpen={isFileDisplayModalOpen}
        onClose={() => setIsFileDisplayModalOpen(false)}
        fileData={fileData}
      />
    </div>
  );
};
