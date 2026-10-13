#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1de403cb67f5de4caaf0210b4d12057d62e4dc47904e75494ea37a216c367341/contract';
import startContract from '../../snapshots/1de403cb67f5de4caaf0210b4d12057d62e4dc47904e75494ea37a216c367341/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/58efe31e42639cdb47630841872966cc1f9703a628200bf874a9f690bfbf3f32/contract';
import endContract from '../../snapshots/58efe31e42639cdb47630841872966cc1f9703a628200bf874a9f690bfbf3f32/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('emailVerified', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('image', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('user'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('user_role_check_b73ac96c', "\"role\" IN ('admin', 'user')"),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
