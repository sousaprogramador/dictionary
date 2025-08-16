// src/components/AudioPlayer.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Ph = { text?: string; audio?: string };

export default function AudioPlayer({
  word,
  phonetics = [],
}: {
  word: string;
  phonetics?: Ph[];
}) {
  const url = useMemo(
    () =>
      phonetics
        ?.map((p) => p.audio?.trim())
        .find((u) => u && /^https?:\/\//.test(u!)) || null,
    [phonetics]
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPos(0);
    setDur(0);
    setPlaying(false);
  }, [url, word]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const time = () => setPos(a.currentTime || 0);
    const meta = () => setDur(a.duration || 0);
    const ended = () => setPlaying(false);
    a.addEventListener('timeupdate', time);
    a.addEventListener('loadedmetadata', meta);
    a.addEventListener('ended', ended);
    return () => {
      a.removeEventListener('timeupdate', time);
      a.removeEventListener('loadedmetadata', meta);
      a.removeEventListener('ended', ended);
    };
  }, []);

  const speakTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(word.replace(/['"]/g, ''));
    u.lang = 'en-US';
    u.onend = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const play = () => {
    if (url && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setPlaying(true);
    } else {
      speakTTS();
    }
  };

  const onSeek = (v: number) => {
    if (!url || !audioRef.current) return;
    audioRef.current.currentTime = v;
    setPos(v);
  };

  const disabled = !url;

  return (
    <div className='player'>
      {url ? <audio ref={audioRef} src={url} preload='metadata' /> : null}
      <button
        className={`btn icon primary ${playing ? 'pulse' : ''}`}
        onClick={play}
        aria-label='Play'
      >
        ▶
      </button>
      <input
        type='range'
        min={0}
        max={Math.max(1, dur)}
        step={0.01}
        value={disabled ? 0 : pos}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        disabled={disabled}
        className={`slider ${disabled ? 'slider-disabled' : ''}`}
      />
    </div>
  );
}
