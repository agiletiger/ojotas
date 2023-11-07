import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';

import { generateSqlFnFromSql } from './generateSqlFnFromSql';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateSqlFnFromSql', () => {
  const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

  it('should create the sql function when querying from a single table listing the columns', async () => {
    const queryName = 'selectAllUsers';
    const sqlFn = generateSqlFnFromSql(
      ojotasConfig,
      queryName,
      "select u.id as 'u.id', u.name as 'u.name' from users u",
    );

    assertEqualIgnoreWhiteSpaces(
      sqlFn,
      fs
        .readFileSync('./snapshots/selectAllUsers.sql.ts')
        .toString()
        .replace('// @ts-nocheck', ''),
    );
  });

  it('should create the sql function when querying a one to many relation', async () => {
    const queryName = 'selectAllUsersWithPosts';
    const sqlFn = generateSqlFnFromSql(
      ojotasConfig,
      queryName,
      'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
    );

    assertEqualIgnoreWhiteSpaces(
      sqlFn,
      fs
        .readFileSync('./snapshots/selectAllUsersWithPosts.sql.ts')
        .toString()
        .replace('// @ts-nocheck', ''),
    );
  });
});
