"use client"

import React, { useState, useRef } from 'react';
import { Paperclip, X, Send, FileUp } from 'lucide-react';

interface GradientUploadInputProps {
  onSubmit?: (message: string, file?: File) => void;
  maxFileSize?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function GradientUploadInput({
  onSubmit,
  maxFileSize = 10,
  disabled = false,
  placeholder = "Upload file or enter text..."
}: GradientUploadInputProps) {
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      alert(`File size must be less than ${maxFileSize}MB`);
      return;
    }
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = () => {
    if (disabled || (!value.trim() && !selectedFile)) return;

    onSubmit?.(value, selectedFile || undefined);
    setValue("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-4">
      <div
        className="relative flex items-center justify-center"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute w-full h-min-screen" style={{ zIndex: -1 }}></div>
        <div id="poda" className="relative flex items-center justify-center group">
          {/* Layer 1 */}
          <div
            className="absolute overflow-hidden h-full w-full max-h-[70px] max-w-[450px] rounded-xl blur-[3px] gradient-layer-animated"
            style={{ zIndex: 0 }}
          >
            <div
              className="absolute w-[999px] h-[999px] bg-no-repeat top-1/2 left-1/2 animate-gradient-1"
              style={{
                background: 'conic-gradient(#000, #402fb5 5%, #000 38%, #000 50%, #cf30aa 60%, #000 87%)',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          {/* Layers 2, 3, 4 */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute overflow-hidden h-full w-full max-h-[65px] max-w-[448px] rounded-xl blur-[3px] gradient-layer-animated"
              style={{ zIndex: 0 }}
            >
              <div
                className="absolute w-[600px] h-[600px] bg-no-repeat top-1/2 left-1/2 animate-gradient-2"
                style={{
                  background: 'conic-gradient(rgba(0,0,0,0), #18116a, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, #6e1b60, rgba(0,0,0,0) 60%)',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
          ))}

          {/* Layer 5 */}
          <div
            className="absolute overflow-hidden h-full w-full max-h-[63px] max-w-[443px] rounded-lg blur-[2px] gradient-layer-animated"
            style={{ zIndex: 0 }}
          >
            <div
              className="absolute w-[600px] h-[600px] bg-no-repeat top-1/2 left-1/2 animate-gradient-3"
              style={{
                background: 'conic-gradient(rgba(0,0,0,0) 0%, #a099d8, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 50%, #dfa2da, rgba(0,0,0,0) 58%)',
                filter: 'brightness(1.4)',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          {/* Layer 6 */}
          <div
            className="absolute overflow-hidden h-full w-full max-h-[59px] max-w-[439px] rounded-xl blur-[0.5px] gradient-layer-animated"
            style={{ zIndex: 0 }}
          >
            <div
              className="absolute w-[600px] h-[600px] bg-no-repeat top-1/2 left-1/2 animate-gradient-4"
              style={{
                background: 'conic-gradient(#1c191c, #402fb5 5%, #1c191c 14%, #1c191c 50%, #cf30aa 60%, #1c191c 64%)',
                filter: 'brightness(1.3)',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          <div id="main" className="relative group" style={{ zIndex: 1 }}>
            <input
              placeholder={placeholder}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="bg-[#010201] border-none w-[437px] h-[56px] rounded-lg text-white px-[59px] pr-[100px] text-lg focus:outline-none placeholder-gray-400"
            />
            <div className="pointer-events-none w-[30px] h-[20px] absolute bg-[#cf30aa] top-[10px] left-[5px] blur-2xl opacity-80 transition-all duration-[2000ms] group-hover:opacity-0 group-focus-within:opacity-0"></div>

            {/* File Upload Button */}
            <div
              className={`absolute h-[42px] w-[40px] overflow-hidden top-[7px] rounded-lg cursor-pointer hover:scale-105 transition-transform ${(value.trim() || selectedFile) ? 'right-[54px]' : 'right-[7px]'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className="absolute w-[600px] h-[600px] animate-spin-slow"
                style={{
                  top: '50%',
                  left: '50%',
                  background: 'conic-gradient(rgba(0,0,0,0), #3d3a4f, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 50%, #3d3a4f, rgba(0,0,0,0) 100%)',
                  filter: 'brightness(1.35)'
                }}
              />
              <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center bg-gradient-to-b from-[#161329] via-black to-[#1d1b4b] border border-transparent rounded-lg" style={{ zIndex: 2, isolation: 'isolate' }}>
                <Paperclip className="w-5 h-5 text-[#d6d6e6]" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              accept="*"
            />

            {/* Submit Button */}
            {(value.trim() || selectedFile) && (
              <div
                className="absolute h-[42px] w-[40px] overflow-hidden top-[7px] right-[7px] rounded-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={handleSubmit}
              >
                <div
                  className="absolute w-[600px] h-[600px] animate-spin-slow"
                  style={{
                    top: '50%',
                    left: '50%',
                    background: 'conic-gradient(rgba(0,0,0,0), #3d3a4f, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 50%, #3d3a4f, rgba(0,0,0,0) 100%)',
                    filter: 'brightness(1.35)'
                  }}
                />
                <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center bg-gradient-to-b from-[#161329] via-black to-[#1d1b4b] border border-transparent rounded-lg" style={{ zIndex: 2, isolation: 'isolate' }}>
                  <Send className="w-5 h-5 text-[#d6d6e6]" />
                </div>
              </div>
            )}

            <div className="absolute left-5 top-[15px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="24" fill="none">
                <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                <line stroke="url(#searchl)" y2="16.65" y1="22" x2="16.65" x1="22"></line>
                <defs>
                  <linearGradient gradientTransform="rotate(50)" id="search">
                    <stop stopColor="#f8e7f8" offset="0%"></stop>
                    <stop stopColor="#b6a9b7" offset="50%"></stop>
                  </linearGradient>
                  <linearGradient id="searchl">
                    <stop stopColor="#b6a9b7" offset="0%"></stop>
                    <stop stopColor="#837484" offset="50%"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20 rounded-xl backdrop-blur-sm pointer-events-none z-10">
            <p className="text-white text-lg font-medium">Drop file here</p>
          </div>
        )}
      </div>

      {/* Selected File Display - below input */}
      {selectedFile && (
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm w-fit px-4 py-2 rounded-full border border-purple-500/30">
          <FileUp className="w-4 h-4 text-purple-300" />
          <span className="text-sm text-white">{selectedFile.name}</span>
          <button
            type="button"
            onClick={clearFile}
            className="ml-1 p-0.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

export default GradientUploadInput;
