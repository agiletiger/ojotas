import { describe, it } from '../test/test-utils';
import assert from 'node:assert';
import fs from 'node:fs';

import { generateSqlDescriptor } from './generateSqlDescriptor';
import { astify } from './parser';
import { Dialect } from './orm';
import { ModelTypes } from './mapSqlTypeToTsType';
import { Relations } from './assemble';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateSqlDescriptor', () => {
  const rootPath = __dirname;

  const modelTypes: ModelTypes = {
    users: {
      id: { type: 'number', nullable: false },
      name: { type: 'string', nullable: false },
      email: { type: 'string', nullable: false },
      age: { type: 'number', nullable: false },
    },
    posts: {
      content: { type: 'string', nullable: true },
      id: { type: 'number', nullable: false },
      title: { type: 'string', nullable: true },
      user_id: { type: 'number', nullable: true },
    },
  };

  const relations: Relations = {
    users: {
      posts: ['hasMany', 'posts'],
    },
  };

  const aliases = {
    u: 'users',
    p: 'posts',
  };

  // snapshots were created for mysql, we are testing the form or the file so that is why this is hardcoded
  // not saying this is the best way but for now works
  const ojotasConfig = { relations, aliases, dialect: 'mysql' as Dialect };

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create the sql function when querying from a single table',
    ({ dialect }) => {
      const queryName = 'selectAllUsers';
      const sqlFn = generateSqlDescriptor(
        rootPath,
        modelTypes,
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
      const sqlFn = generateSqlDescriptor(
        rootPath,
        modelTypes,
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
      const sqlFn = generateSqlDescriptor(
        rootPath,
        modelTypes,
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
      const sqlFn = generateSqlDescriptor(
        rootPath,
        modelTypes,
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
