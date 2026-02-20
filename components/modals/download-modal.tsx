'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeSubmit: (code: string) => void;
}

export function DownloadModal({ isOpen, onClose, onCodeSubmit }: DownloadModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '', '', '']);
  const [isComplete, setIsComplete] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const allFilled = code.every(digit => digit !== '');
    setIsComplete(allFilled);
  }, [code]);

  // Auto-submit on complete
  useEffect(() => {
    if (isComplete) {
      const fullCode = code.join('');
      handleSubmit(fullCode);
    }
  }, [isComplete]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 7) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter' && isComplete) {
      handleSubmit(code.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8);

    if (pastedData.length > 0) {
      const newCode = Array(8).fill('');
      for (let i = 0; i < Math.min(pastedData.length, 8); i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);

      const nextEmptyIndex = newCode.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex === -1 ? 7 : nextEmptyIndex;
      setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
    }
  };

  const handleSubmit = (fullCode: string) => {
    onCodeSubmit(fullCode);
  };

  const clearCode = () => {
    setCode(['', '', '', '', '', '', '', '']);
    setIsComplete(false);
    inputRefs.current[0]?.focus();
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl z-50 p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Enter Download Code</h2>
              <p className="text-sm text-white/60">
                Enter the 8-digit code to download your file
              </p>
            </div>

            {/* Code Input Fields */}
            <div className="flex justify-center gap-2 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-10 h-12 text-center text-xl font-semibold rounded-lg border-2 transition-all duration-200
                    bg-white/5 border-white/20 text-white
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                    ${isComplete ? 'bg-purple-500/20 border-purple-500' : ''}
                  `}
                  maxLength={1}
                  autoComplete="off"
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={clearCode}
                className="w-full py-2 px-4 rounded-lg font-medium border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-white/50">
                Files are available for 24 hours after upload
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
