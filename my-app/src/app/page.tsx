'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth.store';
import { useUi } from '@/store/ui.store';
import { useUserStore } from '@/store/user.store';
import { wordsService } from '@/services/words.service';

export default function Home() {
  const router = useRouter();
  const { token, hydrate } = useAuth();
  useEffect(() => {
    hydrate();
    if (!localStorage.getItem('token')) router.replace('/login');
  }, [hydrate, router]);

  const { tab, setTab } = useUi();
  const { loadMe, loadHistory, loadFavorites, history, favorites } =
    useUserStore();

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const [word, setWord] = useState('hello');
  const [entry, setEntry] = useState<any>(null);
  const [phon, setPhon] = useState('');
  const [audio, setAudio] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  const [list, setList] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    if (!token) return;
    wordsService.get(word).then((d) => {
      setEntry(d?.[0] || null);
      const p = d?.[0]?.phonetics?.find((x: any) => x.text)?.text || '';
      const a = d?.[0]?.phonetics?.find((x: any) => x.audio)?.audio || '';
      setPhon(p);
      setAudio(a);
    });
  }, [token, word]);

  useEffect(() => {
    if (tab !== 'list') return;
    wordsService.list(page, 25).then((d) => {
      setList(d.results);
      setHasNext(d.hasNext);
    });
  }, [tab, page]);

  useEffect(() => {
    if (tab === 'history') loadHistory(1, 25);
  }, [tab, loadHistory]);
  useEffect(() => {
    if (tab === 'favorites') loadFavorites(1, 25);
  }, [tab, loadFavorites]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const h = () => setProgress((el.currentTime / (el.duration || 1)) * 100);
    el.addEventListener('timeupdate', h);
    return () => el.removeEventListener('timeupdate', h);
  }, []);

  const currentPhon = useMemo(
    () => phon || entry?.phonetics?.find((p: any) => p.text)?.text || '',
    [phon, entry]
  );

  return (
    <main className='mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-[1fr_1fr]'>
      <section className='space-y-4'>
        <div className='rounded-2xl border bg-white p-6 shadow'>
          <div className='grid place-items-center rounded-xl bg-fuchsia-200 p-8 text-center'>
            <div className='text-2xl'>{entry?.word || word}</div>
            <div className='mt-2 text-neutral-700'>{currentPhon}</div>
          </div>
          <div className='mt-4 flex items-center gap-3'>
            <button
              onClick={() => audioRef.current?.play()}
              className='grid h-8 w-8 place-items-center rounded-full border'
            >
              ▶
            </button>
            <div className='h-2 w-full rounded bg-neutral-200'>
              <div
                className='h-2 rounded bg-blue-500'
                style={{ width: `${progress}%` }}
              />
            </div>
            <audio ref={audioRef} src={audio} preload='auto' />
          </div>
          <div className='mt-6'>
            <h2 className='text-xl font-semibold'>Meanings</h2>
            {entry?.meanings?.slice(0, 1).map((m: any, i: number) => (
              <div key={i} className='mt-2 text-sm'>
                <span className='font-medium'>{m.partOfSpeech}</span>{' '}
                <span>– {m.definitions?.[0]?.definition}</span>
              </div>
            ))}
          </div>
          <div className='mt-6 flex gap-3'>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className='rounded border px-4 py-2'
            >
              Voltar
            </button>
            <button
              onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
              className='rounded border px-4 py-2'
            >
              Próximo
            </button>
          </div>
        </div>
      </section>

      <section className='space-y-3'>
        <div className='flex gap-2'>
          <button
            onClick={() => setTab('list')}
            className={`rounded px-3 py-1 text-sm ${
              tab === 'list' ? 'bg-neutral-200' : 'border'
            }`}
          >
            Word list
          </button>
          <button
            onClick={() => setTab('history')}
            className={`rounded px-3 py-1 text-sm ${
              tab === 'history' ? 'bg-neutral-200' : 'border'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setTab('favorites')}
            className={`rounded px-3 py-1 text-sm ${
              tab === 'favorites' ? 'bg-neutral-200' : 'border'
            }`}
          >
            Favorites
          </button>
        </div>

        {tab === 'list' && (
          <div className='rounded-2xl border bg-white p-3 shadow'>
            <div className='max-h-[420px] overflow-auto'>
              <table className='w-full table-fixed border-separate border-spacing-0'>
                <tbody>
                  {list.map((w) => (
                    <tr key={w} className='border-b'>
                      <td className='p-2'>
                        <button
                          onClick={() => setWord(w)}
                          className='text-left hover:underline'
                        >
                          {w}
                        </button>
                      </td>
                      <td className='p-2 text-right'>
                        <button
                          onClick={() => wordsService.favorite(w)}
                          className='rounded border px-2 py-1 text-xs'
                        >
                          ☆
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='mt-3 flex items-center justify-end gap-2'>
              <span className='text-sm'>Page {page}</span>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className='rounded-2xl border bg-white p-3 shadow'>
            <div className='max-h-[420px] overflow-auto'>
              <table className='w-full table-fixed border-separate border-spacing-0'>
                <tbody>
                  {history.map((r) => (
                    <tr key={`${r.word}-${r.added}`} className='border-b'>
                      <td className='p-2'>{r.word}</td>
                      <td className='p-2 text-right text-xs text-neutral-500'>
                        {new Date(r.added).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'favorites' && (
          <div className='rounded-2xl border bg-white p-3 shadow'>
            <div className='max-h-[420px] overflow-auto'>
              <table className='w-full table-fixed border-separate border-spacing-0'>
                <tbody>
                  {favorites.map((r) => (
                    <tr key={`${r.word}-${r.added}`} className='border-b'>
                      <td className='p-2'>{r.word}</td>
                      <td className='p-2 text-right'>
                        <button
                          onClick={() =>
                            wordsService.unfavorite(r.word).then(() => {
                              const next = favorites.filter(
                                (f) => f.word !== r.word
                              );
                              useUserStore.setState({ favorites: next });
                            })
                          }
                          className='rounded border px-2 py-1 text-xs'
                        >
                          remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
