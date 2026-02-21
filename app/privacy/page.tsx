'use client';

import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useAnimationFrame
} from "framer-motion";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const GridPattern = ({ offsetX, offsetY, size }: { offsetX: any; offsetY: any; size: number }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="privacy-grid-pattern"
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
      <rect width="100%" height="100%" fill="url(#privacy-grid-pattern)" />
    </svg>
  );
};

export default function PrivacyPage() {
  const gridSize = 50;
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + 0.3) % gridSize);
    gridOffsetY.set((currentY + 0.3) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full min-h-screen flex flex-col items-center overflow-hidden bg-background"
      )}
    >
      {/* Back Button */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="mx-auto px-6 pt-8 pb-6" style={{ maxWidth: '1280px' }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors duration-200 group w-fit pointer-events-auto"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.08]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </div>

      <motion.div
        className="absolute inset-0 z-0 opacity-50"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </motion.div>

      {/* Decorative Blur Spheres */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-blue-500/30 dark:bg-blue-500/20 blur-[120px]" />
        <div className="absolute left-[-15%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-purple-500/30 dark:bg-purple-500/20 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 space-y-4">
          <Image
            src="/uldl_icon_0.png"
            alt="AnyDrop Icon"
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: February 21, 2026
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AnyDrop (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our file sharing service. Please read this policy carefully. By using AnyDrop,
              you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-foreground/90 mb-1">2.1 Account Information</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  When you sign in with Google, we collect your email address, display name, and profile
                  picture URL as provided by Google OAuth. We do not store your Google password.
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground/90 mb-1">2.2 Uploaded Content</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  We store files, images, and text content that you upload to our service. For authenticated
                  users, uploads are associated with your account. For anonymous uploads, content is stored
                  temporarily and linked to a unique 8-digit code.
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground/90 mb-1">2.3 Usage Data</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  We may collect information about how you access and use the service, including your IP
                  address, browser type, device information, and pages visited.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground list-disc list-inside">
              <li>To provide, maintain, and improve the AnyDrop service</li>
              <li>To authenticate your identity and manage your account</li>
              <li>To process and store your uploaded files and content</li>
              <li>To generate unique sharing codes for anonymous uploads</li>
              <li>To communicate with you about service updates or changes</li>
              <li>To detect, prevent, and address technical issues or abuse</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Data Retention</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Anonymous uploads are automatically deleted after 24 hours from the time of upload.
              Authenticated user uploads are retained until you choose to delete them or close your
              account. Account information is retained as long as your account remains active.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Data Sharing</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We do not sell, trade, or rent your personal information to third parties. We may share
              your information only in the following circumstances:
            </p>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground list-disc list-inside">
              <li>With service providers who assist in operating our platform (e.g., Supabase for database and storage)</li>
              <li>When required by law or to respond to legal process</li>
              <li>To protect the rights, property, or safety of AnyDrop, our users, or others</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Data Security</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We implement appropriate technical and organizational security measures to protect your
              personal data. However, no method of transmission over the Internet or electronic storage
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You have the right to access, update, or delete your personal information at any time.
              You can manage your uploaded files from your dashboard. To delete your account entirely,
              please contact us. You may also request a copy of all data we hold about you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Cookies</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use essential cookies to manage authentication sessions and maintain your login state.
              We do not use tracking or advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us through our service.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-4 z-50 text-[10px] uppercase tracking-widest text-muted-foreground opacity-50 font-mono">
        AnyDrop v1.0
      </footer>
    </div>
  );
}
