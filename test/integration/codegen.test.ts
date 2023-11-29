import { describe, before, it } from 'node:test';
import assert from 'node:assert';
import { getConnection } from '../../src/getConnection';
import { codegen } from '../../src/codegen';
import { getTestConfigStatements } from '../helpers/getTestConfigStatements';
import path from 'node:path';
import { Relations } from '../../src/assemble';
import { Dialect } from '../../src/orm';

describe('codegen', async () => {
  const ojotasConfig = {
    relations: {
      users: {
        posts: ['hasMany', 'posts'],
      },
    } as Relations,
    aliases: {
      u: 'users',
      p: 'posts',
    },
    dialect: process.env.DIALECT as Dialect,
  };

  before(async () => {
    const connection = await getConnection(
      process.env.DIALECT as 'mysql' | 'postgres' | undefined,
    );
    const statements = getTestConfigStatements();
    for await (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
    await connection.destroy();
  });

  it('should not throw', async () => {
    const cwd = process.cwd();
    await assert.doesNotReject(async () => {
      await codegen(cwd, ojotasConfig, path.join(cwd, 'test/config/queries'));
    });
  });
});
