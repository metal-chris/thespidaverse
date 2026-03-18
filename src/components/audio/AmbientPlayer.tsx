"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface AmbientPlayerProps {
  audioUrl: string;
  title?: string;
}

export function AmbientPlayer({ audioUrl, title }: AmbientPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [dismissed, setDismissed] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      audioRef.current.preload = "none";
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [audioUrl, isPlaying, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const handleDismiss = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card/95 backdrop-blur-sm border border-border shadow-lg max-w-xs">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-accent text-background hover:opacity-90 transition-opacity shrink-0"
        aria-label={isPlaying ? "Pause ambient audio" : "Play ambient audio"}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="3.5" height="12" rx="1" />
            <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 1.5v11l9-5.5z" />
          </svg>
        )}
      </button>

      {/* Info + waveform */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">
          {title || "Ambient"}
        </p>
        {isPlaying && (
          <div className="flex items-end gap-[2px] h-3 mt-0.5">
            <span className="w-[3px] bg-accent rounded-full animate-now-playing-1" />
            <span className="w-[3px] bg-accent rounded-full animate-now-playing-2" />
            <span className="w-[3px] bg-accent rounded-full animate-now-playing-3" />
          </div>
        )}
      </div>

      {/* Volume */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={handleVolumeChange}
        className="w-14 h-1 accent-accent"
        aria-label="Volume"
      />

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors text-xs"
        aria-label="Dismiss audio player"
      >
        &times;
      </button>
    </div>
  );
}
