import { describe, it } from 'node:test';
import assert from 'node:assert';

import { generateReturnType } from './generateReturnType';
import { Relations } from './assemble';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateReturnType', () => {
  const relations: Relations = {
    users: {
      posts: ['hasMany', 'posts'],
    },
  };

  it('should create the type when querying from a single table listing the columns', () => {
    const queryName = 'selectAllUsers';
    const typeDefinition = generateReturnType(relations, queryName, {
      users: [
        { column: 'id', type: 'number', nullable: false },
        { column: 'name', type: 'string', nullable: false },
      ],
    });

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
    const typeDefinition = generateReturnType(relations, queryName, {
      users: [{ column: 'name', type: 'string', nullable: false }],
      posts: [
        { column: 'title', type: 'string', nullable: true },
        { column: 'content', type: 'string', nullable: true },
      ],
    });

    assertEqualIgnoreWhiteSpaces(
      typeDefinition,
      `
      export interface ISelectAllUsersWithPostsQueryResultItem {
        name: string;
        posts: Array<{
          title?: string;
          content?: string;
        }>;
      }
      `,
    );
  });

  it.skip('should create the type when querying a one to many relation (inner join)', () => {
    const queryName = 'selectAllUsersWithPosts';
    const typeDefinition = generateReturnType(relations, queryName, {
      users: [{ column: 'name', type: 'string', nullable: false }],
      posts: [
        { column: 'title', type: 'string', nullable: true },
        { column: 'content', type: 'string', nullable: true },
      ],
    });

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
    const typeDefinition = generateReturnType(relations, queryName, {
      users: [{ column: 'name', type: 'string', nullable: false }],
      posts: [
        { column: 'title', type: 'string', nullable: true },
        { column: 'content', type: 'string', nullable: true },
      ],
    });

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
