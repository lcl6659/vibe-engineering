'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onUrlSubmit: (url: string) => void;
}

export default function UrlInputBar({ onUrlSubmit }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const validateUrl = (url: string) => {
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*$/;
    const twRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.*$/;
    return ytRegex.test(url) || twRegex.test(url);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    
    if (!trimmed) return;

    if (validateUrl(trimmed)) {
      onUrlSubmit(trimmed);
      setInput('');
      setError(null);
    } else {
      setError('Please enter a valid YouTube or Twitter URL');
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste YouTube or Twitter link..."
          className={`flex-1 px-4 py-3 rounded-lg border bg-white shadow-sm focus:outline-none focus:ring-2 transition-all ${
            error ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'
          }`}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors active:scale-95"
        >
          Parse
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
