'use client';
import { useQuery } from '@tanstack/react-query';
import { entriesService } from '@/lib/api-client';
import { useParams, useRouter } from 'next/navigation';

export default function WordDetail() {
  const params = useParams<{ word: string }>();
  const router = useRouter();
  const w = decodeURIComponent(params.word);
  const q = useQuery({
    queryKey: ['detail', w],
    queryFn: () => entriesService.detail(w),
  });
  const data = q.data || [];
  return (
    <div className='grid'>
      <button className='btn secondary' onClick={() => router.back()}>
        Voltar
      </button>
      <h2>{w}</h2>
      {Array.isArray(data)
        ? data.map((entry: any, i: number) => (
            <div key={i} className='card'>
              <div className='row' style={{ justifyContent: 'space-between' }}>
                <span className='badge'>{entry.word}</span>
                <button
                  className='btn'
                  onClick={() => entriesService.favorite(w)}
                >
                  Favorite
                </button>
                <button
                  className='btn secondary'
                  onClick={() => entriesService.unfavorite(w)}
                >
                  Unfavorite
                </button>
              </div>
              <div className='grid'>
                {(entry.phonetics || []).map((p: any, j: number) => (
                  <div key={j} className='row'>
                    <span className='badge'>{p.text || ''}</span>
                    {p.audio ? <audio controls src={p.audio}></audio> : null}
                  </div>
                ))}
                {(entry.meanings || []).map((m: any, k: number) => (
                  <div key={k} className='card'>
                    <div className='badge'>{m.partOfSpeech}</div>
                    <ul>
                      {(m.definitions || []).map((d: any, idx: number) => (
                        <li key={idx}>
                          {d.definition}
                          {d.example ? ` — ${d.example}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))
        : null}
    </div>
  );
}
