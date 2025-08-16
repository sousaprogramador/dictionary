'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/api-client';

export default function FavoritesPage() {
  const q = useQuery({
    queryKey: ['favorites', 1, 200],
    queryFn: () => userService.favorites(1, 200),
  });

  const items = q.data?.results ?? [];

  return (
    <main className='p-4 md:p-8'>
      <h1 className='text-xl font-semibold mb-4'>Favorites</h1>
      <div className='grid grid-cols-2 md:grid-cols-5 gap-2'>
        {items.map((it: any) => (
          <Link
            key={it.word}
            href={`/?search=${encodeURIComponent(it.word)}`}
            className='border rounded p-3 hover:bg-gray-50'
          >
            {it.word}
          </Link>
        ))}
      </div>
    </main>
  );
}
