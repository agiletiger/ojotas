import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

import { generateReturnTypeFromAst } from './generateReturnTypeFromAst';
import { astify } from './parser';
import { TableDefinition } from './getTablesDefinition';
import { mapMySqlColumnDefinitionToType } from './mapColumnDefinitionToType';

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

  it('should create the type when querying from a single table listing the columns', () => {
    const queryName = 'selectAllUsers';
    const typeDefinition = generateReturnTypeFromAst(
      mapMySqlColumnDefinitionToType,
      tableDefinitions,
      relations,
      queryName,
      astify('select id, name from users'),
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
  });

  it('should create the type when querying a one to many relation', () => {
    const queryName = 'selectAllUsersWithPosts';
    const typeDefinition = generateReturnTypeFromAst(
      mapMySqlColumnDefinitionToType,
      tableDefinitions,
      relations,
      queryName,
      astify(
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
  });

  it.skip('should create the type when querying a one to many relation (inner join)', () => {
    const queryName = 'selectAllUsersWithPosts';
    const typeDefinition = generateReturnTypeFromAst(
      mapMySqlColumnDefinitionToType,
      tableDefinitions,
      relations,
      queryName,
      astify(
        "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id",
      ),
    );

    assertEqualIgnoreWhiteSpaces(
      typeDefinition,
      `
      export interface ISelectAllUsersWithPostsQueryResultItem {
        name: string;
        posts: NonEmptyArray<{
          title: string;
          content: string;
        }>;
      }
      `,
    );
  });

  it.skip('should create the type when querying a one to many relation (left join)', () => {
    const queryName = 'selectAllUsersAndPosts';
    const typeDefinition = generateReturnTypeFromAst(
      mapMySqlColumnDefinitionToType,
      tableDefinitions,
      relations,
      queryName,
      astify(
        "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u left join posts p on u.id = p.user_id",
      ),
    );

    assertEqualIgnoreWhiteSpaces(
      typeDefinition,
      `
      export interface ISelectAllUsersAndPostsQueryResultItem {
        name: string;
        posts: PossiblyEmptyArray<{
          title: string;
          content: string;
        }>;
      }
      `,
    );
  });
});
