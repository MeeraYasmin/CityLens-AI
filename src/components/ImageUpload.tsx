/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, HelpCircle, CheckCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (file: File | null, previewUrl: string | null) => void;
  selectedPreviewUrl: string | null;
}

export function ImageUpload({ onImageSelected, selectedPreviewUrl }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);

    // Validate size (Limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large. Please upload an image smaller than 10MB.');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onImageSelected(file, previewUrl);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageSelected(null, null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          1. Photographic Evidence
        </label>
        <div className="flex gap-1.5 items-center text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          <HelpCircle className="w-3 h-3 text-indigo-500 shrink-0" />
          <span>Multimodal analysis works best with clear close-ups</span>
        </div>
      </div>

      <div
        className={`relative rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
          selectedPreviewUrl
            ? 'border-indigo-500 bg-slate-50'
            : dragActive
            ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/50'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {selectedPreviewUrl ? (
          <div className="relative aspect-video w-full bg-slate-950 group">
            <img
              src={selectedPreviewUrl}
              alt="Evidence preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-between p-3 opacity-90 group-hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-md shadow-md flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Selected
                </span>
                <button
                  onClick={handleClear}
                  className="p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-colors duration-200"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] font-mono text-slate-300 truncate">
                Ready for AI reasoning engine analysis
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
            <UploadCloud className="w-10 h-10 text-slate-400 mb-3 animate-pulse" />
            
            <p className="text-xs font-bold text-slate-700 mb-1">
              Drag & drop photo here or
            </p>
            
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={triggerUpload}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                BROWSE FILES
              </button>
              <button
                type="button"
                onClick={triggerCamera}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                CAPTURE PHOTO
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-medium">
              Supports JPEG, PNG, WEBP up to 10MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
