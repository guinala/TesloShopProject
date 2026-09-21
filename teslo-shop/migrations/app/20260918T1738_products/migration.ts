#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1de403cb67f5de4caaf0210b4d12057d62e4dc47904e75494ea37a216c367341/contract';
import endContract from '../../snapshots/1de403cb67f5de4caaf0210b4d12057d62e4dc47904e75494ea37a216c367341/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/aa6997e265320471554beada375b7cfb48d1d58659a725c0a2c05aac976beea8/contract';
import startContract from '../../snapshots/aa6997e265320471554beada375b7cfb48d1d58659a725c0a2c05aac976beea8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, placeholder } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dataTransform(endContract, 'typechange-category-id', {
        check: () => placeholder('typechange-category-id:check'),
        run: () => placeholder('typechange-category-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'category',
        column: 'id',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-product-categoryId', {
        check: () => placeholder('typechange-product-categoryId:check'),
        run: () => placeholder('typechange-product-categoryId:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'product',
        column: 'categoryId',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-product-id', {
        check: () => placeholder('typechange-product-id:check'),
        run: () => placeholder('typechange-product-id:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'product',
        column: 'id',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
      this.dataTransform(endContract, 'typechange-productImage-productId', {
        check: () => placeholder('typechange-productImage-productId:check'),
        run: () => placeholder('typechange-productImage-productId:run'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'productImage',
        column: 'productId',
        options: {
          qualifiedTargetType: 'uuid',
          formatTypeExpected: 'uuid',
          rawTargetTypeForLabel: 'uuid',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
