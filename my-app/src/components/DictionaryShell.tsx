'use client';

import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { entriesService, userService } from '@/lib/api-client';
import Tabs from './Tabs';
import WordGrid from './WordGrid';
import WordCard from './WordCard';
import SearchBar from './SearchBar';

type Cursor = { next?: string; prev?: string };

export default function DictionaryShell() {
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<'list' | 'fav'>('list');

  const search = params?.get('search') ?? '';
  const limit = Number(params?.get('limit') ?? 20);

  const [selected, setSelected] = useState<string | null>(null);
  const { ref, inView } = useInView();

  const wordsQ = useInfiniteQuery({
    queryKey: ['words', search, limit],
    queryFn: async ({ pageParam }: { pageParam?: Cursor }) => {
      const data = await entriesService.list(search, limit, pageParam);
      return {
        items: data.results || [],
        next: data.next,
        prev: data.previous,
        hasNext: Boolean(data.hasNext),
      };
    },
    getNextPageParam: (last) =>
      last.hasNext && last.next ? { next: last.next } : undefined,
    initialPageParam: {},
  });

  useEffect(() => {
    if (inView && wordsQ.hasNextPage && !wordsQ.isFetchingNextPage)
      wordsQ.fetchNextPage();
  }, [
    inView,
    wordsQ.hasNextPage,
    wordsQ.isFetchingNextPage,
    wordsQ.fetchNextPage,
  ]);

  const allWords = useMemo(
    () => wordsQ.data?.pages.flatMap((p) => p.items) ?? [],
    [wordsQ.data]
  );

  const favQ = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const data = await userService.favorites(1, 200);
      return (data?.results ?? []).map((r: any) => r.word as string);
    },
  });

  useEffect(() => {
    if (!selected && allWords.length) setSelected(allWords[0]);
  }, [allWords, selected]);

  const onPrev = () => {
    const base = tab === 'fav' ? favQ.data ?? [] : allWords;
    if (!selected || !base.length) return;
    const idx = Math.max(
      0,
      base.findIndex((w) => w === selected)
    );
    const prev = base[idx - 1];
    if (prev) setSelected(prev);
  };

  const onNext = () => {
    const base = tab === 'fav' ? favQ.data ?? [] : allWords;
    if (!selected || !base.length) return;
    const idx = Math.max(
      0,
      base.findIndex((w) => w === selected)
    );
    const next = base[idx + 1];
    if (next) setSelected(next);
  };

  const rightWords = tab === 'fav' ? favQ.data ?? [] : allWords;

  return (
    <div className='md:grid md:grid-cols-3 md:gap-6'>
      <div className='md:col-span-2 mb-6 md:mb-0'>
        <WordCard word={selected} onPrev={onPrev} onNext={onNext} />
      </div>

      <aside className='md:col-span-1'>
        <Tabs active={tab} onChange={setTab} />
        <SearchBar />
        <div className='border rounded p-3'>
          <WordGrid
            words={rightWords}
            selected={selected}
            onSelect={(w) => setSelected(w)}
            className='max-h-[28rem] overflow-auto'
          />
          <div ref={ref} />
        </div>
      </aside>
    </div>
  );
}
