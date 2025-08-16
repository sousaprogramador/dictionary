import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT || 5432),
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DB || 'dictionary',
  entities: [path.join(__dirname, '..', 'entities', '*.js')],
  migrations: [path.join(__dirname, 'migrations', '*.js')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
});

export default dataSource;
