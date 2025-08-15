import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT || 5432),
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DB || 'dictionary',
  entities: [__dirname + '/src/infra/entities/*.{ts,js}'],
  migrations: [__dirname + '/src/infra/database/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
