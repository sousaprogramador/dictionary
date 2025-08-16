'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { entriesService, userService } from '@/lib/api-client';
import AudioPlayer from './AudioPlayer';

type Cursor = { next?: string; prev?: string };

export default function DictionaryShell() {
  const client = useQueryClient();
  const [tab, setTab] = useState<'list' | 'favorites'>('list');
  const [search, setSearch] = useState('');
  const [limit] = useState(20);
  const [current, setCurrent] = useState<string | null>(null);

  type Cursor = { next?: string; prev?: string };
  type CursorPage = {
    results: string[];
    hasNext: boolean;
    next?: string;
    hasPrev: boolean;
    previous?: string;
  };

  const listQ = useInfiniteQuery({
    queryKey: ['words', search, limit] as const,
    initialPageParam: { next: undefined, prev: undefined } as Cursor,
    queryFn: async ({ pageParam }: { pageParam: Cursor }) =>
      entriesService.list(search, limit, pageParam),
    getNextPageParam: (last: CursorPage): Cursor | undefined =>
      last.hasNext ? { next: last.next, prev: undefined } : undefined,
    getPreviousPageParam: (last: CursorPage): Cursor | undefined =>
      last.hasPrev ? { prev: last.previous, next: undefined } : undefined,
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
    enabled: tab === 'favorites' || !!current,
  });

  const isFavorited = useMemo(() => {
    const list: string[] = favQ.data?.results?.map((r: any) => r.word) || [];
    return current ? list.includes(current) : false;
  }, [favQ.data, current]);

  const favMut = useMutation({
    mutationFn: async (word: string) => {
      if (isFavorited) await entriesService.unfavorite(word);
      else await entriesService.favorite(word);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const phonetics = detailQ.data?.[0]?.phonetics || [];
  const phoneticText: string =
    phonetics.find((p: any) => p.text)?.text || phonetics?.[0]?.text || '';

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
      const nextPages = client.getQueryData<any>(['words', search, limit]);
      const nextWords: string[] = Array.from(
        new Set((nextPages?.pages || []).flatMap((p: any) => p.results)),
      );
      const nidx = nextWords.indexOf(current);
      if (nidx < nextWords.length - 1) setCurrent(nextWords[nidx + 1]);
    }
  };

  const rightList = tab === 'favorites' ? favQ.data?.results?.map((r: any) => r.word) || [] : words;

  const onSearch = async () => {
    await listQ.refetch();
    const fresh = client.getQueryData<any>(['words', search, limit])?.pages?.[0]?.results || [];
    setCurrent(fresh[0] || null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 24 }}>
      <section className="card" style={{ padding: 16 }}>
        <div className="card pron-card" style={{ background: '#f3cdd1', border: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, opacity: 0.7 }}>{current ? `"${current}"` : '—'}</div>
            <div style={{ marginTop: 8 }}>{phoneticText || ' '}</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <AudioPlayer word={current || ''} phonetics={phonetics} />
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Meanings</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {(detailQ.data?.[0]?.meanings || []).map((m: any, i: number) => (
              <div key={i} className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{m.partOfSpeech}</div>
                <div style={{ marginTop: 6 }}>{m.definitions?.[0]?.definition || ''}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <button className="btn secondary" onClick={goPrev}>
            Voltar
          </button>
          <button className="btn" onClick={goNext}>
            Próximo
          </button>
          <div style={{ flex: 1 }} />
          <button
            className={`btn ${isFavorited ? 'warning' : 'secondary'}`}
            disabled={!current || favMut.isPending}
            onClick={() => current && favMut.mutate(current)}
          >
            {isFavorited ? 'Remover favorito' : 'Salvar favorito'}
          </button>
        </div>
      </section>

      <aside className="card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="tabs">
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
              className="input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
            />
            <button className="btn btn-sm" onClick={onSearch}>
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
          <div className="word-grid">
            {rightList.map((w: string) => (
              <button
                key={w}
                className="word-chip"
                onClick={() => setCurrent(w)}
                aria-current={current === w}
                style={current === w ? { outline: `4px solid var(--ring)` } : undefined}
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
              <button className="btn btn-sm secondary" onClick={() => listQ.fetchNextPage()}>
                Carregar mais
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
