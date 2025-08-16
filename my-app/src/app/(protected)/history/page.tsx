'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { userService } from '@/lib/api-client';

dayjs.extend(relativeTime);

export default function HistoryPage() {
  const q = useQuery({
    queryKey: ['history', 1, 50],
    queryFn: () => userService.history(1, 50),
  });

  const items = q.data?.results ?? [];

  return (
    <main className='p-4 md:p-8'>
      <h1 className='text-xl font-semibold mb-4'>History</h1>
      <ul className='space-y-2'>
        {items.map((it: any) => (
          <li
            key={it.word}
            className='flex items-center justify-between border rounded px-3 py-2'
          >
            <Link
              href={`/?search=${encodeURIComponent(it.word)}`}
              className='hover:underline'
            >
              {it.word}
            </Link>
            <span className='text-xs text-gray-500'>
              {dayjs(it.added).fromNow()}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
