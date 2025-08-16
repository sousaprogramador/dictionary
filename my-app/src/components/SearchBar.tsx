'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params?.get('search') ?? '';
  const [q, setQ] = useState(initial);

  useEffect(() => setQ(initial), [initial]);

  const apply = () => {
    const usp = new URLSearchParams(Array.from(params?.entries() ?? []));
    if (q) usp.set('search', q);
    else usp.delete('search');
    if (!usp.get('limit')) usp.set('limit', '20');
    router.replace(`/?${usp.toString()}`);
  };

  return (
    <div className='mb-3 flex gap-2'>
      <input
        className='w-full border rounded px-3 py-2'
        placeholder='Search…'
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
      />
      <button className='px-3 py-2 rounded border' onClick={apply}>
        Go
      </button>
    </div>
  );
}
