'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HoverButton } from '@/components/ui/hover-button';

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <Image
            src="/uldl_icon_0.png"
            alt="ULDL Icon"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Right side - Get Started Button */}
        <Link href="/auth">
          <HoverButton className="px-4 py-2 text-sm">
            Get Started
          </HoverButton>
        </Link>
      </div>
    </nav>
  );
};
