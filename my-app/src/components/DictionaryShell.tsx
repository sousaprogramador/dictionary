'use client';

import { useEffect, useMemo, useState } from 'react';
import { entriesService } from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';
import AudioPlayer from './AudioPlayer';
import WordGrid from './WordGrid';

type DictEntry = any;

export default function DictionaryShell() {
  const params = useSearchParams();
  const word = params.get('word') || '';
  const [entry, setEntry] = useState<DictEntry | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!word) {
        setEntry(null);
        return;
      }
      const data = await entriesService.detail(word);
      if (active) setEntry(Array.isArray(data) ? data[0] : data);
    })();
    return () => {
      active = false;
    };
  }, [word]);

  const audioSrc = useMemo(() => {
    const a = entry?.phonetics?.find((p: any) => p.audio)?.audio as
      | string
      | undefined;
    return a || undefined;
  }, [entry]);

  return (
    <div className='page'>
      <div className='shell'>
        <div className='left'>
          <div className='card word-card'>
            <div className='word'>{entry?.word ?? '—'}</div>
            <div className='phon'>
              {entry?.phonetics?.find((p: any) => p.text)?.text ?? ''}
            </div>
          </div>

          <AudioPlayer src={audioSrc} />

          <div className='meanings'>
            <h3>Meanings</h3>
            <div className='meanings-body'>
              {entry?.meanings?.[0]?.definitions?.[0]?.definition ?? ''}
            </div>
            <div className='actions'>
              <button
                className='btn btn-outline'
                onClick={() => history.back()}
                type='button'
              >
                Voltar
              </button>
              <button className='btn btn-primary' type='button'>
                Próximo
              </button>
            </div>
          </div>
        </div>

        <div className='right'>
          <WordGrid />
        </div>
      </div>
    </div>
  );
}
