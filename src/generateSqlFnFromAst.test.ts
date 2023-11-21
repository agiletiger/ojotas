import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { generateSqlFnFromAst } from './generateSqlFnFromAst';
import { astify } from './parser';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateSqlFnFromAst', () => {
  const rootPath = __dirname;
  const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

  it('should create the sql function when querying from a single table', () => {
    const queryName = 'selectAllUsers';
    const sqlFn = generateSqlFnFromAst(
      rootPath,
      ojotasConfig,
      queryName,
      astify('select id, name from users'),
    );

    assertEqualIgnoreWhiteSpaces(
      sqlFn,
      fs
        .readFileSync('./snapshots/selectAllUsers.sql.ts')
        .toString()
        .replace('// @ts-nocheck', ''),
    );
  });

  it('should create the sql function when querying a one to many relation', () => {
    const queryName = 'selectAllUsersWithPosts';
    const sqlFn = generateSqlFnFromAst(
      rootPath,
      ojotasConfig,
      queryName,
      astify(
        'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
      ),
    );

    assertEqualIgnoreWhiteSpaces(
      sqlFn,
      fs
        .readFileSync('./snapshots/selectAllUsersWithPosts.sql.ts')
        .toString()
        .replace('// @ts-nocheck', ''),
    );
  });

  it('should create the sql function when querying from a single table with params', () => {
    const queryName = 'selectUsersByName';
    const sqlFn = generateSqlFnFromAst(
      rootPath,
      ojotasConfig,
      queryName,
      astify('select id, name from users where name like :name'),
    );

    assertEqualIgnoreWhiteSpaces(
      sqlFn,
      fs
        .readFileSync('./snapshots/selectUsersByName.sql.ts')
        .toString()
        .replace('// @ts-nocheck', ''),
    );
  });

  it('should create the sql function when querying a one to many relation with params', () => {
    const queryName = 'selectUsersWithCertainPosts';
    const sqlFn = generateSqlFnFromAst(
      rootPath,
      ojotasConfig,
      queryName,
      astify(
        'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id where p.title like :title',
      ),
    );

    assertEqualIgnoreWhiteSpaces(
      sqlFn,
      fs
        .readFileSync('./snapshots/selectUsersWithCertainPosts.sql.ts')
        .toString()
        .replace('// @ts-nocheck', ''),
    );
  });
});
