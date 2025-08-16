'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { entriesService, userService } from '@/lib/api-client';

type Cursor = { next?: string; prev?: string };

export default function DictionaryShell() {
  const client = useQueryClient();
  const [tab, setTab] = useState<'list' | 'favorites'>('list');
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState<string | null>(null);

  const listQ = useInfiniteQuery({
    queryKey: ['words', search, limit],
    queryFn: async ({ pageParam }: { pageParam?: Cursor }) =>
      entriesService.list(search, limit, pageParam),
    initialPageParam: {} as Cursor,
    getNextPageParam: (last) =>
      last?.hasNext ? { next: last.next } : undefined,
    getPreviousPageParam: (last) =>
      last?.hasPrev ? { prev: last.previous } : undefined,
  });

  const words = useMemo(() => {
    const flat = (listQ.data?.pages || []).flatMap((p) => p.results);
    return Array.from(new Set(flat));
  }, [listQ.data]);

  useEffect(() => {
    if (!current && words.length) setCurrent(words[0]);
  }, [words, current]);

  const detailQ = useQuery({
    queryKey: ['detail', current],
    queryFn: async () => (current ? entriesService.detail(current) : null),
    enabled: !!current,
  });

  const favQ = useQuery({
    queryKey: ['favorites', limit],
    queryFn: async () => userService.favorites(1, limit),
    enabled: tab === 'favorites',
  });

  const phoneticText: string =
    detailQ.data?.[0]?.phonetics?.find((p: any) => p.text)?.text ||
    detailQ.data?.[0]?.phonetics?.[0]?.text ||
    '';

  const audioUrl: string =
    detailQ.data?.[0]?.phonetics?.find((p: any) => p.audio)?.audio || '';

  const onPlay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = progress;
    audioRef.current.play();
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const update = () => setProgress(el.currentTime);
    el.addEventListener('timeupdate', update);
    return () => el.removeEventListener('timeupdate', update);
  }, []);

  const onSeek = (v: number) => {
    setProgress(v);
    if (audioRef.current) audioRef.current.currentTime = v;
  };

  const goPrev = () => {
    if (!current) return;
    const idx = words.indexOf(current);
    if (idx > 0) setCurrent(words[idx - 1]);
  };

  const goNext = async () => {
    if (!current) return;
    const idx = words.indexOf(current);
    if (idx < words.length - 1) setCurrent(words[idx + 1]);
    else if (listQ.hasNextPage) {
      await listQ.fetchNextPage();
      const nextWords = Array.from(
        new Set(
          (
            client.getQueryData<any>(['words', search, limit])?.pages || []
          ).flatMap((p: any) => p.results)
        )
      );
      const nidx = nextWords.indexOf(current);
      if (nidx < nextWords.length - 1) setCurrent(nextWords[nidx + 1]);
    }
  };

  const rightList =
    tab === 'favorites'
      ? favQ.data?.results?.map((r: any) => r.word) || []
      : words;

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 24 }}
    >
      <section className='card' style={{ padding: 16 }}>
        <div
          className='card pron-card'
          style={{ background: '#f3cdd1', border: 0 }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, opacity: 0.7 }}>
              {current ? `"${current}"` : '—'}
            </div>
            <div style={{ marginTop: 8 }}>{phoneticText || ' '}</div>
          </div>
        </div>

        <div className='player'>
          <button className='play' onClick={onPlay} aria-label='Play'>
            ▶
          </button>
          <input
            type='range'
            min={0}
            max={audioRef.current?.duration || 1}
            step={0.01}
            value={progress}
            onChange={(e) => onSeek(Number(e.target.value))}
          />
          <audio ref={audioRef} src={audioUrl} preload='metadata' />
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Meanings</div>
          <div style={{ minHeight: 40 }}>
            {detailQ.data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition ||
              ''}
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <button className='btn secondary' onClick={goPrev}>
            Voltar
          </button>
          <button className='btn' onClick={goNext}>
            Próximo
          </button>
        </div>
      </section>

      <aside className='card' style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className='tabs'>
            <button
              className={`tab ${tab === 'list' ? 'active' : ''}`}
              onClick={() => setTab('list')}
            >
              Word list
            </button>
            <button
              className={`tab ${tab === 'favorites' ? 'active' : ''}`}
              onClick={() => setTab('favorites')}
            >
              Favorites
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className='input'
              placeholder='Search...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
            />
            <button className='btn btn-sm' onClick={() => listQ.refetch()}>
              Go
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            maxHeight: 480,
            overflow: 'auto',
            padding: 4,
          }}
        >
          <div className='word-grid'>
            {rightList.map((w: string) => (
              <button
                key={w}
                className='word-chip'
                onClick={() => setCurrent(w)}
                aria-current={current === w}
                style={
                  current === w
                    ? { outline: `4px solid var(--ring)` }
                    : undefined
                }
              >
                {w}
              </button>
            ))}
          </div>

          {tab === 'list' && listQ.hasNextPage && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 12,
              }}
            >
              <button
                className='btn btn-sm secondary'
                onClick={() => listQ.fetchNextPage()}
              >
                Carregar mais
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
