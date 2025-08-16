import 'reflect-metadata';
import { dataSource } from '../src/infra/database/data-source';

async function run() {
  const name = process.argv[2] || 'AutoMigration';
  await dataSource.initialize();
  await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  const file = await dataSource.generateMigration(name, {
    pretty: true,
    dir: 'src/infra/database/migrations',
  });
  console.log('Generated:', file);
  await dataSource.destroy();
}
run();
