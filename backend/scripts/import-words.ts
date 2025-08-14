import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { datasource } from '../src/config/orm.config';
import axios from 'axios';
import { WordTypeormEntity } from '../src/modules/dictionary/infra/persistence/word.typeorm.entity';

async function run() {
  const ds = await new DataSource(datasource.options as any).initialize();
  const repo = ds.getRepository(WordTypeormEntity);
  const urls = [
    'https://raw.githubusercontent.com/meetDeveloper/freeDictionaryAPI/master/meta/wordList/english.txt',
  ];
  for (const url of urls) {
    const { data } = await axios.get(url);
    const words: string[] = data
      .split('\n')
      .map((w: string) => w.trim())
      .filter(Boolean);
    const chunks = Array.from(
      { length: Math.ceil(words.length / 1000) },
      (_, i) => words.slice(i * 1000, i * 1000 + 1000),
    );
    for (const batch of chunks) {
      await repo
        .createQueryBuilder()
        .insert()
        .into(WordTypeormEntity)
        .values(batch.map((word) => ({ word })))
        .orIgnore()
        .execute();
    }
  }
  await ds.destroy();
}
run();
