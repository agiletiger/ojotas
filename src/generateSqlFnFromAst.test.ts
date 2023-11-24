import { describe, it } from '../test/test-utils';
import assert from 'node:assert';
import fs from 'node:fs';

import { generateSqlFnFromAst } from './generateSqlFnFromAst';
import { astify } from './parser';
import { Dialect } from './orm';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateSqlFnFromAst', () => {
  const rootPath = __dirname;
  const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create the sql function when querying from a single table',
    ({ dialect }) => {
      const queryName = 'selectAllUsers';
      const sqlFn = generateSqlFnFromAst(
        rootPath,
        ojotasConfig,
        queryName,
        astify(dialect, 'select id, name from users'),
      );

      assertEqualIgnoreWhiteSpaces(
        sqlFn,
        fs
          .readFileSync('./snapshots/selectAllUsers.sql.ts')
          .toString()
          .replace('// @ts-nocheck', ''),
      );
    },
  );

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create the sql function when querying a one to many relation',
    ({ dialect }) => {
      const queryName = 'selectAllUsersWithPosts';
      const sqlFn = generateSqlFnFromAst(
        rootPath,
        ojotasConfig,
        queryName,
        astify(
          dialect,
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
    },
  );

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create the sql function when querying from a single table with params',
    ({ dialect }) => {
      const queryName = 'selectUsersByName';
      const sqlFn = generateSqlFnFromAst(
        rootPath,
        ojotasConfig,
        queryName,
        astify(dialect, 'select id, name from users where name like :name'),
      );

      assertEqualIgnoreWhiteSpaces(
        sqlFn,
        fs
          .readFileSync('./snapshots/selectUsersByName.sql.ts')
          .toString()
          .replace('// @ts-nocheck', ''),
      );
    },
  );

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create the sql function when querying a one to many relation with params',
    ({ dialect }) => {
      const queryName = 'selectUsersWithCertainPosts';
      const sqlFn = generateSqlFnFromAst(
        rootPath,
        ojotasConfig,
        queryName,
        astify(
          dialect,
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
    },
  );
});
