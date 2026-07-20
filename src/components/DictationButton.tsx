/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import React, { useEffect } from 'react';

interface DictationButtonProps {
  onTranscriptChange: (text: string) => void;
}

export function DictationButton({ onTranscriptChange }: DictationButtonProps) {
  const {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  // Pipe the transcript back to the caller
  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded">
        <MicOff className="w-3 h-3 text-slate-400 shrink-0" />
        <span>Voice Dictation Unsupported in this Browser</span>
      </div>
    );
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggle}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-300 shadow-sm ${
          isListening
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
        }`}
        title={isListening ? 'Stop listening' : 'Start speaking'}
        aria-label={isListening ? 'Stop speech recognition' : 'Start speech recognition'}
      >
        {isListening ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>LISTENING...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5" />
            <span>SPEAK DESCRIPTION</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold mt-1">
          <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
