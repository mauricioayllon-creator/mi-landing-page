'use client';

import { useState } from 'react';

const BASE_SRC = 'https://play.gumlet.io/embed/69d0ae6347eee1605a471273';
const PAUSED_SRC = `${BASE_SRC}?autoplay=false&muted=true&loop=false`;
const PLAY_SRC = `${BASE_SRC}?autoplay=true&muted=false&loop=false&t=0`;

export default function VideoPlayer() {
  const [playing, setPlaying] = useState(false);
  const [src, setSrc] = useState(PAUSED_SRC);

  function handlePlay() {
    setSrc(PLAY_SRC);
    setPlaying(true);
  }

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(174,216,247,0.2)] ring-1 ring-white/10 bg-black">
      <iframe
        key={src}
        className="w-full h-full"
        src={src}
        title="Video de presentación"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />

      {!playing && (
        <button
          onClick={handlePlay}
          aria-label="Reproducir video"
          className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/40 hover:bg-black/30 transition-colors duration-200 cursor-pointer"
        >
          <span className="flex items-center justify-center w-24 h-24 rounded-full bg-white/90 shadow-[0_0_40px_rgba(174,216,247,0.6)] hover:scale-110 active:scale-95 transition-transform duration-200">
            <svg
              className="w-10 h-10 translate-x-1"
              viewBox="0 0 24 24"
              fill="#0a0f3d"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
