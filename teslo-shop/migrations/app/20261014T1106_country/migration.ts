#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/58efe31e42639cdb47630841872966cc1f9703a628200bf874a9f690bfbf3f32/contract';
import startContract from '../../snapshots/58efe31e42639cdb47630841872966cc1f9703a628200bf874a9f690bfbf3f32/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/63816d1856a2707fd9dba49e37f0bafb4319ed047d54e1599a1d156e539892ba/contract';
import endContract from '../../snapshots/63816d1856a2707fd9dba49e37f0bafb4319ed047d54e1599a1d156e539892ba/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'country',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
