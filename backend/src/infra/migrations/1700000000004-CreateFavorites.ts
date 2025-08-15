import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavorites1700000000004 implements MigrationInterface {
  name = 'CreateFavorites1700000000004';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table if not exists favorites (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null references users(id) on delete cascade,
        word_id uuid not null references words(id) on delete cascade,
        added timestamptz not null default now(),
        unique(user_id, word_id)
      )
    `);
    await queryRunner.query(
      `create index if not exists idx_favorites_user_added on favorites(user_id, added desc)`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index if exists idx_favorites_user_added`);
    await queryRunner.query(`drop table if exists favorites`);
  }
}
