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
      columns: {
        users: [
          { name: 'id', type: 'number', nullable: false },
          { name: 'name', type: 'string', nullable: false },
        ],
      },
      joinMetadata: {},
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

  it('should create the type when querying a one to many relation (inner join)', () => {
    const queryName = 'selectAllUsersWithPosts';
    const typeDefinition = generateReturnType(relations, queryName, {
      columns: {
        users: [{ name: 'name', type: 'string', nullable: false }],
        posts: [
          { name: 'title', type: 'string', nullable: true },
          { name: 'content', type: 'string', nullable: true },
        ],
      },
      joinMetadata: { users: { posts: 'INNER JOIN' } },
    });

    assertEqualIgnoreWhiteSpaces(
      typeDefinition,
      `
      export interface ISelectAllUsersWithPostsQueryResultItem {
        name: string;
        posts: NonEmptyArray<{
          title?: string;
          content?: string;
        }>;
      }
      `,
    );
  });

  it('should create the type when querying a one to many relation (left join)', () => {
    const queryName = 'selectAllUsersAndPosts';
    const typeDefinition = generateReturnType(relations, queryName, {
      columns: {
        users: [{ name: 'name', type: 'string', nullable: false }],
        posts: [
          { name: 'title', type: 'string', nullable: true },
          { name: 'content', type: 'string', nullable: true },
        ],
      },
      joinMetadata: { users: { posts: 'LEFT JOIN' } },
    });

    assertEqualIgnoreWhiteSpaces(
      typeDefinition,
      `
      export interface ISelectAllUsersAndPostsQueryResultItem {
        name: string;
        posts: PossiblyEmptyArray<{
          title?: string;
          content?: string;
        }>;
      }
      `,
    );
  });
});
