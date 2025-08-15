import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHistories1700000000003 implements MigrationInterface {
  name = 'CreateHistories1700000000003';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table if not exists histories (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null references users(id) on delete cascade,
        word_id uuid not null references words(id) on delete cascade,
        added timestamptz not null default now()
      )
    `);
    await queryRunner.query(
      `create index if not exists idx_histories_user_added on histories(user_id, added desc)`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index if exists idx_histories_user_added`);
    await queryRunner.query(`drop table if exists histories`);
  }
}
