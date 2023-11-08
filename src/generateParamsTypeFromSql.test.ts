import { after, before, describe, it } from 'node:test';
import * as assert from 'node:assert';

import * as mysql from 'mysql2/promise';

import { generateParamsTypeFromSql } from './generateParamsTypeFromSql';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateParamsTypeFromSql', () => {
  let connection: mysql.Connection;
  const database = process.env.DB_NAME as string;
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

  it('should be no type if no params', async () => {
    const queryName = 'selectAllUsers';
    const paramsType = await generateParamsTypeFromSql(
      connection,
      database,
      queryName,
      'select id, name from users',
    );

    assertEqualIgnoreWhiteSpaces(paramsType, ``);
  });

  it('should throw error if querying from multiple tables and not using aliases', async () => {
    const queryName = 'queryName';

    await assert.rejects(() =>
      generateParamsTypeFromSql(
        connection,
        database,
        queryName,
        'select id, name from users join posts on users.id = posts.user_id where name like :name',
      ),
    );
  });

  it('should create a mandatory string type when having a param in where statement', async () => {
    const queryName = 'selectUsersFilteredByName';
    const paramsType = await generateParamsTypeFromSql(
      connection,
      database,
      queryName,
      'select id, name from users where name like :name',
    );

    assertEqualIgnoreWhiteSpaces(
      paramsType,
      `
      export interface ISelectUsersFilteredByNameQueryParams {
        name: string;
      }
      `,
    );
  });

  it('should create an optional string type when having an optional param in where statement', async () => {
    const queryName = 'selectUsersFilteredByName';
    const paramsType = await generateParamsTypeFromSql(
      connection,
      database,
      queryName,
      'select id, name from users where name like :name?',
    );

    assertEqualIgnoreWhiteSpaces(
      paramsType,
      `
      export interface ISelectUsersFilteredByNameQueryParams {
        name?: string;
      }
      `,
    );
  });
});
