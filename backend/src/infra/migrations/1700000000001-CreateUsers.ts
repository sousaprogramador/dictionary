import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1700000000001 implements MigrationInterface {
  name = 'CreateUsers1700000000001';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create extension if not exists "pgcrypto"`);
    await queryRunner.query(`
      create table if not exists users (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        email text not null unique,
        password_hash text not null,
        created_at timestamptz not null default now()
      )
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table if exists users`);
  }
}
