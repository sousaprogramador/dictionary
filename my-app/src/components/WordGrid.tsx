'use client';

import { useEffect, useMemo, useState } from 'react';
import { entriesService, type CursorPage } from '@/lib/api-client';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

type Props = { limit?: number };

export default function WordGrid({ limit = 24 }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(() => params.get('search') || '');

  useEffect(() => {
    setSearch(params.get('search') || '');
  }, [params]);

  const { ref, inView } = useInView({ rootMargin: '600px 0px' });
  const queryKey = useMemo(() => ['words', search, limit], [search, limit]);

  const q = useInfiniteQuery({
    queryKey,
    queryFn: async ({
      pageParam,
    }: {
      pageParam?: { next?: string; prev?: string };
    }) => {
      const data = await entriesService.list(search, limit, pageParam);
      return data as CursorPage;
    },
    // só avança se realmente existir um cursor "next"
    getNextPageParam: (last) => (last?.next ? { next: last.next } : undefined),
    initialPageParam: undefined as { next?: string; prev?: string } | undefined,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  useEffect(() => {
    const hasNextCursor =
      !!q.data?.pages?.length && !!q.data.pages[q.data.pages.length - 1]?.next;

    if (inView && hasNextCursor && !q.isFetchingNextPage) {
      q.fetchNextPage();
    }
  }, [inView, q]);

  // dedupe para evitar itens repetidos quando a API retornar a mesma página
  const words = useMemo(() => {
    const s = new Set<string>();
    q.data?.pages.forEach((p) => p.results.forEach((w) => s.add(w)));
    return Array.from(s);
  }, [q.data]);

  return (
    <div className='panel'>
      <div className='panel-header'>
        <div className='tabs'>
          <button
            className='tab tab-active'
            onClick={() => router.push('/')}
            type='button'
          >
            Word list
          </button>
          <button
            className='tab'
            onClick={() => router.push('/favorites')}
            type='button'
          >
            Favorites
          </button>
        </div>

        <form
          className='search'
          onSubmit={(e) => {
            e.preventDefault();
            const usp = new URLSearchParams();
            if (search) usp.set('search', search);
            router.push(`/?${usp.toString()}`);
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search...'
          />
          <button className='btn btn-sm' type='submit'>
            Go
          </button>
        </form>
      </div>

      <div className='grid'>
        {words.map((w) => (
          <button
            key={w}
            className='chip'
            onClick={() => router.push(`/word?word=${encodeURIComponent(w)}`)}
            type='button'
            title={w}
          >
            {w}
          </button>
        ))}
      </div>

      {/* sentinela para rolagem infinita */}
      <div ref={ref} style={{ height: 1 }} />
    </div>
  );
}
