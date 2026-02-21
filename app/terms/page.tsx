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
          id="terms-grid-pattern"
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
      <rect width="100%" height="100%" fill="url(#terms-grid-pattern)" />
    </svg>
  );
};

export default function TermsPage() {
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
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-indigo-500/30 dark:bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-[-15%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-violet-500/30 dark:bg-violet-500/20 blur-[120px]" />
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: February 21, 2026
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8 text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By accessing or using AnyDrop (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
              These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AnyDrop is a file sharing service that allows users to upload, store, and share files,
              images, and text content. The Service provides both authenticated (account-based) and
              anonymous (code-based, 24-hour expiration) file sharing capabilities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You may sign in using your Google account. You are responsible for maintaining the
              security of your account and for all activities that occur under your account.
              You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Acceptable Use</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You agree not to use the Service to:
            </p>
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground list-disc list-inside">
              <li>Upload, share, or distribute any content that is illegal, harmful, or violates the rights of others</li>
              <li>Distribute malware, viruses, or any other harmful software</li>
              <li>Infringe upon any intellectual property rights of third parties</li>
              <li>Upload content that is obscene, defamatory, or promotes violence or discrimination</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems</li>
              <li>Use the Service for any commercial purpose without our prior written consent</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Content Ownership</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You retain all rights to the content you upload to AnyDrop. By uploading content,
              you grant us a limited license to store, process, and serve your content as necessary
              to provide the Service. We do not claim ownership of any content you upload.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Anonymous Uploads</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Anonymous uploads are accessible to anyone who has the 8-digit sharing code.
              Anonymous uploads are automatically deleted after 24 hours. We are not responsible
              for any unauthorized access to anonymously shared content by third parties who
              obtain the sharing code.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. File Size and Storage Limits</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The Service enforces file size limits (currently 10MB per file). We reserve the right
              to modify these limits at any time. We may also impose storage limits for authenticated
              user accounts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Content Removal</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We reserve the right to remove any content that violates these Terms of Service or
              that we determine to be harmful, without prior notice. We may also suspend or terminate
              accounts that repeatedly violate these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Disclaimer of Warranties</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              either express or implied. We do not guarantee that the Service will be uninterrupted,
              secure, or error-free. We are not responsible for any loss of data or content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To the maximum extent permitted by law, AnyDrop shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or
              revenues, whether incurred directly or indirectly, or any loss of data, use, or
              goodwill arising out of your use of the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">11. Changes to Terms</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We reserve the right to modify these Terms of Service at any time. We will provide
              notice of significant changes by updating the &quot;Last updated&quot; date at the top of
              this page. Your continued use of the Service after changes constitutes acceptance
              of the updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">12. Contact Us</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us through our service.
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
