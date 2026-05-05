'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { GradientUploadInput } from '@/components/ui/gradient-upload-input';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [uploadCodes, setUploadCodes] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (message: string, files?: File[]) => {
    if (!message.trim() && (!files || files.length === 0)) return;

    try {
      setUploading(true);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      if (files && files.length > 0) {
        // Check total storage limit
        const { data: totalBytes } = await supabase.rpc('get_total_storage_bytes');
        const MAX_STORAGE_BYTES = 990 * 1024 * 1024;
        if ((totalBytes ?? 0) >= MAX_STORAGE_BYTES) {
          throw new Error('Storage limit exceeded (990MB). Please try again later.');
        }

        // One code for all files
        const code = Math.floor(10000000 + Math.random() * 90000000).toString();

        // Upload all files in parallel, sharing the same code
        await Promise.all(files.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const filePath = `anonymous/${code}_${index}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error(`Failed to upload ${file.name}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

          const uploadType = file.type.startsWith('image/') ? 'image' : 'file';

          const { error: dbError } = await supabase
            .from('uploads')
            .insert({
              user_id: null,
              type: uploadType,
              filename: file.name,
              url: publicUrl,
              text_content: message.trim() || null,
              thumbnail_url: uploadType === 'image' ? publicUrl : null,
              code,
              expires_at: expiresAt.toISOString(),
            });

          if (dbError) {
            console.error('Database error:', dbError);
            throw new Error(`Failed to save ${file.name}`);
          }
        }));

        setUploadCodes([code]);
      } else {
        // Text only
        const code = Math.floor(10000000 + Math.random() * 90000000).toString();

        const { error: dbError } = await supabase
          .from('uploads')
          .insert({
            user_id: null,
            type: 'text',
            filename: null,
            url: null,
            text_content: message.trim(),
            thumbnail_url: null,
            code,
            expires_at: expiresAt.toISOString(),
          });

        if (dbError) {
          console.error('Database error:', dbError);
          throw new Error('Failed to save upload');
        }

        setUploadCodes([code]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setUploadCodes([]);
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
            className="fixed inset-0 bg-black/60 z-50"
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-2xl border border-white/10 rounded-2xl shadow-2xl z-50 p-8"
            style={{ backgroundColor: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
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
            <div className="mb-6">
              <GradientUploadInput
                onSubmit={handleUpload}
                maxFileSize={10}
                disabled={uploading}
                placeholder="Upload file or text..."
              />
            </div>

            {uploading && (
              <div className="text-center text-sm text-white/60 mb-4">
                Uploading...
              </div>
            )}

            {/* Upload Code Display */}
            {uploadCodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl"
              >
                <p className="text-sm text-white/70 mb-2 text-center">Your download code:</p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-3xl font-mono font-bold text-white tracking-wider">
                    {uploadCodes[0]}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(uploadCodes[0]);
                      alert('Code copied!');
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-white/50 mt-3 text-center">
                  Files are available for 24 hours
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
