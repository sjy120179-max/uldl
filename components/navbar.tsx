'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HoverButton } from '@/components/ui/hover-button';
import { GradientAvatar } from '@/components/ui/gradient-avatar';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, LogOut } from 'lucide-react';

interface NavbarProps {
  user?: User | null;
}

export const Navbar = ({ user }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="mx-auto flex items-center justify-between" style={{ maxWidth: '1280px' }}>
        {/* Left side - Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/uldl_icon_0.png"
            alt="AnyDrop Icon"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold text-white">AnyDrop</h1>
        </Link>

        {/* Right side - Get Started Button or Profile */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hover:opacity-80 transition-opacity focus:outline-none"
            >
              <GradientAvatar userId={user.id} size={32} />
            </button>

            {/* Dropdown Modal */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden">
                {/* User Email */}
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm text-white/60">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate">{user.email}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">내 파일 관리</span>
                  </Link>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Sign Out */}
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth">
            <HoverButton className="px-4 py-2 text-sm">
              Get Started
            </HoverButton>
          </Link>
        )}
      </div>
    </nav>
  );
};
