"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Music3, Play, Pause, Volume2, VolumeX } from "lucide-react";

export default function AudioWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Free Lofi Radio (Lofi Girl or similar creative commons stream)
  // Using a reliable generic creative commons chill lofi mp3 stream
  const LOFI_STREAM_URL = "https://stream.zeno.fm/f3wvbbqmdg8uv";

  useEffect(() => {
    // We create the audio element dynamically to avoid SSR issues
    const audio = new Audio(LOFI_STREAM_URL);
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    const handlePlay = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsVisible(true);
        }).catch(err => console.log("Audio autoplay blocked by browser until user interaction:", err));
      }
    };

    const handleStop = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        // We keep it visible so user can manually resume if they want, 
        // or we could hide it. Let's keep it visible once activated.
      }
    };

    window.addEventListener("play-music", handlePlay);
    window.addEventListener("stop-music", handleStop);

    return () => {
      window.removeEventListener("play-music", handlePlay);
      window.removeEventListener("stop-music", handleStop);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in">
      <div className="glass-panel p-2 pr-4 rounded-full flex items-center gap-3 shadow-lg shadow-black/20 border border-[var(--glass-border)] bg-[var(--card-bg)]/80 backdrop-blur-xl">
        <button 
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        
        <div className="flex flex-col">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Music3 className="w-3 h-3 text-primary animate-pulse" /> Chill LoFi
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)]">OmniTime Radio</span>
        </div>

        <button 
          onClick={toggleMute}
          className="ml-2 p-1.5 rounded-full hover:bg-[var(--glass-border)] transition-colors text-[var(--muted-foreground)] hover:text-foreground"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
