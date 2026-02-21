'use client';

import { X, Download, Copy, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FileData {
  type: 'file' | 'image' | 'text';
  filename?: string;
  url?: string;
  text_content?: string;
  thumbnail_url?: string;
}

interface FileDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: FileData | null;
}

export function FileDisplayModal({ isOpen, onClose, fileData }: FileDisplayModalProps) {
  if (!fileData) return null;

  const handleDownload = async () => {
    if (fileData.url && fileData.filename) {
      try {
        const response = await fetch(fileData.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileData.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Download error:', error);
        window.open(fileData.url, '_blank');
      }
    }
  };

  const handleCopy = async () => {
    if (fileData.text_content) {
      try {
        await navigator.clipboard.writeText(fileData.text_content);
        alert('Copied to clipboard!');
      } catch (error) {
        console.error('Error copying:', error);
        alert('Failed to copy');
      }
    }
  };

  const getThumbnail = () => {
    if (fileData.thumbnail_url) {
      return fileData.thumbnail_url;
    }
    if (fileData.type === 'image' && fileData.url) {
      return fileData.url;
    }
    return null;
  };

  const thumbnail = getThumbnail();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-6">Your Content</h2>

            {/* Content Display */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                {/* Thumbnail/Icon */}
                <div className="flex-shrink-0 w-16 h-16 rounded-md bg-white/10 flex items-center justify-center overflow-hidden">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={fileData.filename || 'Content'}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white/60">
                      {fileData.type === 'text' ? (
                        <FileText className="w-8 h-8" />
                      ) : (
                        <ImageIcon className="w-8 h-8" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0">
                  {fileData.text_content && (
                    <p className="text-white whitespace-pre-wrap break-words mb-2">
                      {fileData.text_content}
                    </p>
                  )}
                  {fileData.filename && (
                    <p className="text-white font-medium truncate">
                      {fileData.filename}
                    </p>
                  )}
                  <p className="text-white/50 text-sm capitalize mt-1">
                    {fileData.type}
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {fileData.type === 'text' ? (
                    <button
                      onClick={handleCopy}
                      className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="Copy text"
                    >
                      <Copy className="w-5 h-5 text-white" />
                    </button>
                  ) : (
                    <button
                      onClick={handleDownload}
                      className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <p className="text-xs text-white/50 text-center">
              This content will be automatically deleted after 24 hours
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
