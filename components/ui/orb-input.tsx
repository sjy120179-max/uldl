"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { FileUp, X, Send } from "lucide-react"

interface OrbInputProps {
  onSubmit?: (message: string, file?: File) => void
  maxFileSize?: number
  disabled?: boolean
}

export function OrbInput({ onSubmit, maxFileSize = 10, disabled = false }: OrbInputProps) {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep the placeholders stable across renders
  const placeholders = useMemo(
    () => [
      "Upload a file or enter text...",
      "Drop a file here...",
      "What would you like to share?",
      "Files, images, or text...",
    ],
    []
  )

  // Config: tweak the animation to taste
  const CHAR_DELAY = 75 // ms between characters while typing
  const IDLE_DELAY_AFTER_FINISH = 2200 // ms to wait after a full sentence is shown

  // Refs to hold active timers so they can be cleaned up
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // clear any stale timers (helps with StrictMode double-invoke in dev)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const current = placeholders[placeholderIndex]
    if (!current) {
      setDisplayedText("")
      setIsTyping(false)
      return
    }

    const chars = Array.from(current)

    // reset state for a new round
    setDisplayedText("")
    setIsTyping(true)

    let charIndex = 0

    // type character-by-character using a derived slice to avoid any chance of appending undefined
    intervalRef.current = setInterval(() => {
      if (charIndex < chars.length) {
        const next = chars.slice(0, charIndex + 1).join("")
        setDisplayedText(next)
        charIndex += 1
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsTyping(false)

        // after a brief pause, advance to the next placeholder
        timeoutRef.current = setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
        }, IDLE_DELAY_AFTER_FINISH)
      }
    }, CHAR_DELAY)

    // Cleanup on unmount or when placeholderIndex changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [placeholderIndex, placeholders])

  const handleFileSelect = (file: File) => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      alert(`File size must be less than ${maxFileSize}MB`)
      return
    }
    setSelectedFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSubmit = () => {
    if (disabled || (!value.trim() && !selectedFile)) return

    onSubmit?.(value, selectedFile || undefined)
    setValue("")
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="relative">
      {/* Selected File Display */}
      {selectedFile && (
        <div className="mb-4 flex items-center gap-2 bg-black/50 dark:bg-white/5 w-fit px-4 py-2 rounded-full border border-gray-600">
          <FileUp className="w-4 h-4 text-white" />
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

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center gap-4 p-6 bg-black shadow-lg transition-all duration-300 ease-out rounded-full border ${
          isDragging
            ? "border-blue-500 shadow-blue-500/50 scale-[1.02]"
            : isFocused
            ? "shadow-xl scale-[1.02] border-gray-600"
            : "border-gray-300 shadow-lg"
        }`}
      >
        <div
          className="relative flex-shrink-0 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload file"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden transition-all duration-300 scale-100 hover:scale-105">
            <img
              src="https://media.giphy.com/media/26gsuUjoEBmLrNBxC/giphy.gif"
              alt="Animated orb"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileInputChange}
            accept="*"
          />
        </div>

        <div className="w-px h-12 bg-gray-600" />

        <div className="flex-1 w-[500px]">
          <input
            data-testid="orb-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={`${displayedText}${isTyping ? "|" : ""}`}
            aria-label="Ask a question"
            className="w-full text-xl text-white placeholder-gray-400 bg-transparent border-none outline-none font-light"
          />
        </div>

        {(value.trim() || selectedFile) && (
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className="flex-shrink-0 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            title="Submit"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-full pointer-events-none">
          <p className="text-white text-lg font-medium">Drop file here</p>
        </div>
      )}
    </div>
  )
}

export default OrbInput
