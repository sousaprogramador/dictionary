const { DataSource } = require('typeorm');
require('dotenv').config();

const ds = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT || 5432),
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DB || 'dictionary',
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/infra/migrations/*.js'],
  synchronize: false,
  logging: false,
});

(async () => {
  try {
    await ds.initialize();
    await ds.runMigrations();
  } catch (e) {
    console.error('Migration error:', e);
    process.exit(1);
  } finally {
    await ds.destroy().catch(() => {});
  }
})();
