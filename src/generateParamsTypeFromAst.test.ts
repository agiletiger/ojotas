import { after, before, describe, it } from 'node:test';
import * as assert from 'node:assert';

import * as mysql from 'mysql2/promise';

import { generateParamsTypeFromAst } from './generateParamsTypeFromAst';
import { astify } from './parser';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateParamsTypeFromAst', () => {
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
    const paramsType = await generateParamsTypeFromAst(
      connection,
      database,
      queryName,
      astify('select id, name from users'),
    );

    assertEqualIgnoreWhiteSpaces(paramsType, ``);
  });

  it('should create a mandatory string type when having a param in where statement', async () => {
    const queryName = 'selectUsersFilteredByName';
    const paramsType = await generateParamsTypeFromAst(
      connection,
      database,
      queryName,
      astify('select id, name from users where name like :name'),
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
    const paramsType = await generateParamsTypeFromAst(
      connection,
      database,
      queryName,
      astify('select id, name from users where name like :name?'),
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
