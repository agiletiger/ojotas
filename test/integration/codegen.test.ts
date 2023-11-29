import { describe, before, it } from 'node:test';
import assert from 'node:assert';
import { getConnection } from '../../src/getConnection';
import { codegen } from '../../src/codegen';
import { getTestConfigStatements } from '../helpers/getTestConfigStatements';
import path from 'node:path';

describe('codegen', async () => {
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
      await codegen(cwd, path.join(cwd, 'test/config/queries'));
    });
  });
});
