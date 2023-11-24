import { describe, it } from '../test/test-utils';
import assert from 'node:assert';
import fs from 'node:fs';

import { generateReturnTypeFromAst } from './generateReturnTypeFromAst';
import { astify } from './parser';
import { TableDefinition } from './getTablesDefinition';
import { mapMySqlColumnDefinitionToType } from './mapColumnDefinitionToType';
import { Dialect } from './orm';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateReturnTypeFromAst', () => {
  const tableDefinitions: Record<string, TableDefinition> = {
    users: {
      id: { udtName: 'int', nullable: false },
      name: { udtName: 'varchar', nullable: false },
    },
    posts: {
      content: { udtName: 'text', nullable: true },
      id: { udtName: 'int', nullable: false },
      title: { udtName: 'varchar', nullable: true },
      user_id: { udtName: 'int', nullable: true },
    },
  };
  const relations = JSON.parse(
    fs.readFileSync('.ojotasrc.json').toString(),
  ).relations;

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create the type when querying from a single table listing the columns',
    ({ dialect }) => {
      const queryName = 'selectAllUsers';
      const typeDefinition = generateReturnTypeFromAst(
        mapMySqlColumnDefinitionToType,
        tableDefinitions,
        relations,
        queryName,
        astify(dialect, 'select id, name from users'),
      );

      assertEqualIgnoreWhiteSpaces(
        typeDefinition,
        `
      export interface ISelectAllUsersQueryResultItem {
        id: number; 
        name: string;
      }
      `,
      );
    },
  );

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])(
    '$dialect - should create the type when querying a one to many relation',
    ({ dialect }) => {
      const queryName = 'selectAllUsersWithPosts';
      const typeDefinition = generateReturnTypeFromAst(
        mapMySqlColumnDefinitionToType,
        tableDefinitions,
        relations,
        queryName,
        astify(
          dialect,
          "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id",
        ),
      );

      assertEqualIgnoreWhiteSpaces(
        typeDefinition,
        `
      export interface ISelectAllUsersWithPostsQueryResultItem {
        name: string;
        posts: Array<{
          content: string;
          title: string;
        }>;
      }
      `,
      );
    },
  );

  // it.each([
  //   { dialect: 'mysql' as Dialect },
  //   { dialect: 'postgres' as Dialect },
  // ])(
  //   '$dialect - should create the type when querying a one to many relation (inner join)',
  //   ({ dialect }) => {
  //     const queryName = 'selectAllUsersWithPosts';
  //     const typeDefinition = generateReturnTypeFromAst(
  //       mapMySqlColumnDefinitionToType,
  //       tableDefinitions,
  //       relations,
  //       queryName,
  //       astify(
  //         dialect,
  //         "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id",
  //       ),
  //     );

  //     assertEqualIgnoreWhiteSpaces(
  //       typeDefinition,
  //       `
  //     export interface ISelectAllUsersWithPostsQueryResultItem {
  //       name: string;
  //       posts: NonEmptyArray<{
  //         title: string;
  //         content: string;
  //       }>;
  //     }
  //     `,
  //     );
  //   },
  // );

  // it.each([
  //   { dialect: 'mysql' as Dialect },
  //   { dialect: 'postgres' as Dialect },
  // ])(
  //   '$dialect - should create the type when querying a one to many relation (left join)',
  //   ({ dialect }) => {
  //     const queryName = 'selectAllUsersAndPosts';
  //     const typeDefinition = generateReturnTypeFromAst(
  //       mapMySqlColumnDefinitionToType,
  //       tableDefinitions,
  //       relations,
  //       queryName,
  //       astify(
  //         dialect,
  //         "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u left join posts p on u.id = p.user_id",
  //       ),
  //     );

  //     assertEqualIgnoreWhiteSpaces(
  //       typeDefinition,
  //       `
  //     export interface ISelectAllUsersAndPostsQueryResultItem {
  //       name: string;
  //       posts: PossiblyEmptyArray<{
  //         title: string;
  //         content: string;
  //       }>;
  //     }
  //     `,
  //     );
  //   },
  // );
});
