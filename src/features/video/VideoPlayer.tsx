'use client';

import { useState } from 'react';

const BASE_SRC = 'https://play.gumlet.io/embed/69d0ae6347eee1605a471273';
const AUTOPLAY_MUTED_SRC = `${BASE_SRC}?autoplay=1&mute=1&loop=1`;
const PLAY_WITH_SOUND_SRC = `${BASE_SRC}?autoplay=1&mute=0&loop=0&t=0`;

export default function VideoPlayer() {
  const [withSound, setWithSound] = useState(false);

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(174,216,247,0.2)] ring-1 ring-white/10 bg-black">
      {withSound ? (
        <iframe
          className="w-full h-full"
          src={PLAY_WITH_SOUND_SRC}
          title="Video de presentación"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <>
          <iframe
            className="w-full h-full"
            src={AUTOPLAY_MUTED_SRC}
            title="Video de presentación"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
          <button
            onClick={() => setWithSound(true)}
            aria-label="Activar sonido"
            className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/40 hover:bg-black/30 transition-colors duration-200 cursor-pointer"
          >
            <span className="flex flex-col items-center justify-center gap-3">
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
              <span className="text-white text-sm font-bold uppercase tracking-widest bg-black/50 px-4 py-1.5 rounded-full">
                Activar Sonido
              </span>
            </span>
          </button>
        </>
      )}
    </div>
  );
}
