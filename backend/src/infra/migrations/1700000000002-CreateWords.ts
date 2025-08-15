import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWords1700000000002 implements MigrationInterface {
  name = 'CreateWords1700000000002';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table if not exists words (
        id uuid primary key default gen_random_uuid(),
        word text not null unique
      )
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table if exists words`);
  }
}
