'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Hero } from "@/components/main/hero";
import { Navbar } from "@/components/navbar";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <main className="w-full relative min-h-screen">
      <Navbar user={user} />
      <Hero />
    </main>
  );
}