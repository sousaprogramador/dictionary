'use client';

import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entriesService } from '@/lib/api-client';

export default function WordCard({
  word,
  onPrev,
  onNext,
}: {
  word: string | null;
  onPrev: () => void;
  onNext: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const q = useQuery({
    queryKey: ['detail', word],
    queryFn: async () => {
      if (!word) return null;
      const data = await entriesService.detail(word);
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: Boolean(word),
  });

  const audioUrl = useMemo(() => {
    const ph = q.data?.phonetics || [];
    return ph.find((p: any) => p.audio)?.audio || '';
  }, [q.data]);

  return (
    <div className='rounded-2xl border bg-white p-5 shadow-sm'>
      <div className='h-56 rounded-xl bg-rose-200 flex items-center justify-center text-center'>
        <div>
          <div className='text-xl font-medium'>{word ?? '—'}</div>
          <div className='text-sm text-gray-700 mt-2'>
            {q.data?.phonetics?.find((p: any) => p.text)?.text ?? ''}
          </div>
        </div>
      </div>

      <div className='flex items-center gap-3 mt-4'>
        <button
          onClick={() => audioRef.current?.play()}
          className='h-8 w-8 rounded-full border flex items-center justify-center'
          aria-label='Play'
        >
          ▶
        </button>
        <input type='range' className='w-full' readOnly />
        {audioUrl ? (
          <audio ref={audioRef} src={audioUrl} preload='none' />
        ) : null}
      </div>

      <div className='mt-5'>
        <h3 className='text-xl font-bold'>Meanings</h3>
        <div className='mt-2 text-sm text-gray-700 space-y-2'>
          {(q.data?.meanings ?? []).slice(0, 4).map((m: any, idx: number) => (
            <div key={idx}>
              <span className='font-semibold'>{m.partOfSpeech}</span> –{' '}
              {m.definitions?.[0]?.definition ?? ''}
            </div>
          ))}
        </div>
      </div>

      <div className='mt-5 flex gap-3'>
        <button onClick={onPrev} className='px-4 py-2 rounded-md border'>
          Voltar
        </button>
        <button onClick={onNext} className='px-4 py-2 rounded-md border'>
          Próximo
        </button>
      </div>
    </div>
  );
}
