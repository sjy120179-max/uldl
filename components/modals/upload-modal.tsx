'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { GradientUploadInput } from '@/components/ui/gradient-upload-input';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [uploadCode, setUploadCode] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (message: string, file?: File) => {
    if (!message.trim() && !file) return;

    try {
      setUploading(true);

      // Generate 8-digit code
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();

      // Create form data
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (message.trim()) {
        formData.append('text', message.trim());
      }
      formData.append('code', code);

      // Upload to API
      const response = await fetch('/api/anonymous-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadCode(code);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setUploadCode(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 p-8"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-6">Upload File or Text</h2>

            {/* Upload Input */}
            <div className="mb-6 flex justify-center">
              <GradientUploadInput
                onSubmit={handleUpload}
                maxFileSize={10}
                disabled={uploading}
                placeholder="Upload file or enter text..."
              />
            </div>

            {uploading && (
              <div className="text-center text-sm text-white/60 mb-4">
                Uploading...
              </div>
            )}

            {/* Upload Code Display */}
            {uploadCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl"
              >
                <p className="text-sm text-white/70 mb-2 text-center">Your download code:</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-3xl font-mono font-bold text-white tracking-wider">
                    {uploadCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(uploadCode);
                      alert('Code copied!');
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-white/50 mt-3 text-center">
                  This file will be available for 24 hours
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
