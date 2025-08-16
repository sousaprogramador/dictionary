'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { userService } from '@/lib/api-client';

type Cursor = { next?: string; prev?: string };
type Props = { initial?: { search?: string; limit?: number } };

const DEFAULT_LIMIT = 20;

export default function InfiniteWords({ initial }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const urlSearch = params?.get('search') ?? '';
  const urlLimit = Number(params?.get('limit') ?? DEFAULT_LIMIT);

  const [query, setQuery] = useState<string>(initial?.search ?? urlSearch);
  const [limit, setLimit] = useState<number>(initial?.limit ?? urlLimit);

  useEffect(() => {
    setQuery(urlSearch);
    setLimit(urlLimit);
  }, [urlSearch, urlLimit]);

  const qk = useMemo(() => ['words', query, limit], [query, limit]);

  const q = useInfiniteQuery({
    queryKey: qk,
    queryFn: async ({ pageParam }: { pageParam?: Cursor }) => {
      const usp = new URLSearchParams();
      if (query) usp.set('search', query);
      usp.set('limit', String(limit));
      if (pageParam?.next) usp.set('next', pageParam.next);
      if (pageParam?.prev) usp.set('prev', pageParam.prev);

      const { data, headers } = await userService.get(
        `/entries/en?${usp.toString()}`
      );
      return {
        items: (data?.results ?? []) as string[],
        next: data?.next as string | undefined,
        prev: data?.previous as string | undefined,
        hasNext: Boolean(data?.hasNext),
        hasPrev: Boolean(data?.hasPrev),
        totalDocs: Number(data?.totalDocs ?? 0),
        headers,
      };
    },
    getNextPageParam: (last) =>
      last.hasNext && last.next ? { next: last.next } : undefined,
    getPreviousPageParam: (last) =>
      last.hasPrev && last.prev ? { prev: last.prev } : undefined,
    initialPageParam: {},
    refetchOnWindowFocus: false,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
  }, [inView, q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage]);

  const applyUrl = (s: string, l: number) => {
    const usp = new URLSearchParams(window.location.search);
    if (s) usp.set('search', s);
    else usp.delete('search');
    usp.set('limit', String(l));
    router.replace(`/?${usp.toString()}`);
  };

  const onSearch = (s: string) => {
    setQuery(s);
    applyUrl(s, limit);
  };

  const onLimitChange = (l: number) => {
    const safe = Math.max(1, Math.min(100, l || DEFAULT_LIMIT));
    setLimit(safe);
    applyUrl(query, safe);
  };

  return (
    <div className='space-y-4'>
      {/* Search controls */}
      <div className='flex gap-2'>
        <input
          className='border rounded px-3 py-2 w-full'
          placeholder='Search word…'
          value={query}
          onChange={(e) => onSearch(e.target.value)}
        />
        <input
          type='number'
          className='border rounded px-3 py-2 w-28'
          min={1}
          max={100}
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          aria-label='Limit'
        />
      </div>

      {/* Results */}
      <ul className='divide-y rounded border'>
        {q.data?.pages
          .flatMap((p) => p.items)
          .map((w) => (
            <li key={w} className='p-3'>
              {w}
            </li>
          ))}
      </ul>

      <div ref={ref} />

      {q.isFetchingNextPage && (
        <p className='text-sm text-gray-500'>loading…</p>
      )}
      {q.isError && <p className='text-red-600 text-sm'>failed to load</p>}
    </div>
  );
}
