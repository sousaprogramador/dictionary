'use client';

import { useEffect, useRef, useState } from 'react';

type Props = { src?: string };

export default function AudioPlayer({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    // reset sempre que a fonte muda
    a.pause();
    a.currentTime = 0;
    setProgress(0);
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !src) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  return (
    <div className='player'>
      <button className='btn btn-play' onClick={toggle} aria-label='Play/Pause'>
        ▶
      </button>

      <input
        type='range'
        min={0}
        max={1}
        step={0.01}
        value={progress}
        onChange={(e) => {
          const v = Number(e.target.value);
          setProgress(v);
          const a = audioRef.current;
          if (a && a.duration) a.currentTime = v * a.duration;
        }}
        className='slider'
      />

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a && a.duration) setProgress(a.currentTime / a.duration);
        }}
      />
    </div>
  );
}
