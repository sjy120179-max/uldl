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
  fileData: FileData[] | null;
}

async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    window.open(url, '_blank');
  }
}

function FileItem({ item }: { item: FileData }) {
  const thumbnail = item.thumbnail_url || (item.type === 'image' && item.url ? item.url : null);

  const handleCopy = async () => {
    if (item.text_content) {
      try {
        await navigator.clipboard.writeText(item.text_content);
        alert('Copied to clipboard!');
      } catch {
        alert('Failed to copy');
      }
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-md bg-white/10 flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={item.filename || 'Content'}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white/60">
              {item.type === 'text' ? (
                <FileText className="w-7 h-7" />
              ) : (
                <ImageIcon className="w-7 h-7" />
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {item.text_content && (
            <p className="text-white whitespace-pre-wrap break-words mb-1">
              {item.text_content}
            </p>
          )}
          {item.filename && (
            <p className="text-white font-medium truncate">{item.filename}</p>
          )}
          <p className="text-white/50 text-sm capitalize mt-1">{item.type}</p>
        </div>

        <div className="flex-shrink-0">
          {item.type === 'text' ? (
            <button
              onClick={handleCopy}
              className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Copy text"
            >
              <Copy className="w-5 h-5 text-white" />
            </button>
          ) : (
            <button
              onClick={() => item.url && item.filename && downloadFile(item.url, item.filename)}
              className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Download file"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FileDisplayModal({ isOpen, onClose, fileData }: FileDisplayModalProps) {
  if (!fileData || fileData.length === 0) return null;

  const handleDownloadAll = async () => {
    for (const item of fileData) {
      if (item.url && item.filename) {
        await downloadFile(item.url, item.filename);
      }
    }
  };

  const hasMultipleFiles = fileData.filter(f => f.type !== 'text').length > 1;

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 p-8 max-h-[85vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Title */}
            <div className="flex items-center justify-between mb-6 pr-8">
              <h2 className="text-2xl font-bold text-white">Your Content</h2>
              {hasMultipleFiles && (
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              )}
            </div>

            {/* Content List */}
            <div className="flex flex-col gap-3 mb-6">
              {fileData.map((item, index) => (
                <FileItem key={index} item={item} />
              ))}
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
