import { after, before, describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';

import * as mysql from 'mysql2/promise';

import { generateTypeDefinitionFromSql } from './generateTypeDefinitionFromSql';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateTypeDefinitionFromSql', () => {
  let connection: mysql.Connection;
  const database = process.env.DB_NAME as string;
  const relations = JSON.parse(
    fs.readFileSync('.ojotasrc.json').toString(),
  ).relations;
  before(async () => {
    const connectionOptions: mysql.ConnectionOptions = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };
    connection = await mysql.createConnection(connectionOptions);
  });

  after(() => {
    connection.destroy();
  });

  it('should create the type when querying from a single table listing the columns', async () => {
    const queryName = 'selectAllUsers';
    const typeDefinition = await generateTypeDefinitionFromSql(
      relations,
      connection,
      database,
      queryName,
      "select u.id as 'u.id', u.name as 'u.name' from users u",
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

  it('should create the type when querying a one to many relation', async () => {
    const queryName = 'selectAllUsersWithPosts';
    const typeDefinition = await generateTypeDefinitionFromSql(
      relations,
      connection,
      database,
      queryName,
      "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id",
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

  it.skip('should create the type when querying a one to many relation (inner join)', async () => {
    const queryName = 'selectAllUsersWithPosts';
    const typeDefinition = await generateTypeDefinitionFromSql(
      relations,
      connection,
      database,
      queryName,
      "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id",
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

  it.skip('should create the type when querying a one to many relation (left join)', async () => {
    const queryName = 'selectAllUsersAndPosts';
    const typeDefinition = await generateTypeDefinitionFromSql(
      relations,
      connection,
      database,
      queryName,
      "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u left join posts p on u.id = p.user_id",
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
