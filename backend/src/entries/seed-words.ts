import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import axios from 'axios';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import ormconfig from '../../ormconfig';
import { Word } from '../infra/entities/word.entity';

loadEnv();

async function getWordList(): Promise<string[]> {
  const localFile = process.env.SEED_WORDS_FILE;
  const url =
    process.env.WORDLIST_URL ||
    'https://raw.githubusercontent.com/meetDeveloper/freeDictionaryAPI/master/meta/wordList/english.txt';

  let raw: string;
  if (localFile) {
    raw = readFileSync(resolve(process.cwd(), localFile), 'utf-8');
  } else {
    const { data } = await axios.get<string>(url, { responseType: 'text' });
    raw = data;
  }

  return raw
    .split(/\r?\n/)
    .map((w) => w.trim())
    .filter(Boolean);
}

async function run() {
  const ds = new DataSource(ormconfig.options as any);
  await ds.initialize();
  const repo = ds.getRepository(Word);

  const words = Array.from(new Set(await getWordList()));
  console.log(`Total de palavras para inserir: ${words.length}`);

  const chunkSize = 1000;
  for (let i = 0; i < words.length; i += chunkSize) {
    const slice = words.slice(i, i + chunkSize).map((word) => ({ word }));
    await repo.createQueryBuilder().insert().into(Word).values(slice).orIgnore().execute();

    console.log(
      `Inseridas (ou ignoradas se já existirem): ${Math.min(
        i + chunkSize,
        words.length,
      )}/${words.length}`,
    );
  }

  await ds.destroy();
  console.log('Seed finalizado com sucesso.');
}

run().catch((err) => {
  console.error('Falha ao executar seed:', err);
  process.exit(1);
});
