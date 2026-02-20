'use client';

import React from 'react';

interface GradientAvatarProps {
  userId: string;
  size?: number;
  className?: string;
}

/**
 * Generate a deterministic gradient based on user ID
 */
function generateGradient(userId: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate two colors from hash
  const hue1 = Math.abs(hash % 360);
  const hue2 = Math.abs((hash * 137) % 360);

  const saturation = 70 + (Math.abs(hash % 20));
  const lightness = 50 + (Math.abs((hash * 7) % 15));

  const color1 = `hsl(${hue1}, ${saturation}%, ${lightness}%)`;
  const color2 = `hsl(${hue2}, ${saturation}%, ${lightness}%)`;

  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

export function GradientAvatar({ userId, size = 40, className = '' }: GradientAvatarProps) {
  const gradient = generateGradient(userId);

  return (
    <div
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: gradient,
      }}
    />
  );
}

export default GradientAvatar;
