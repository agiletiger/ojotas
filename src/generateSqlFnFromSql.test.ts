import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';

import { generateSqlFnFromSql } from './generateSqlFnFromSql';

const assertEqualIgnoreWhiteSpaces = (actual: string, expected: string) =>
  assert.equal(actual.replace(/\s+/g, ' '), expected.replace(/\s+/g, ' '));

describe('generateSqlFnFromSql', () => {
  const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

  it('should create the sql function when querying from a single table listing the columns', async () => {
    const queryName = 'selectAllUsers';
    const sqlFn = generateSqlFnFromSql(
      ojotasConfig,
      queryName,
      "select u.id as 'u.id', u.name as 'u.name' from users u",
    );

    assertEqualIgnoreWhiteSpaces(
      sqlFn,
      `
      export const selectAllUsers = (connection: mysql.Connection, assemble, ojotasConfig) => {
        const sql = "select u.id as 'u.id', u.name as 'u.name' from users u";
        try {
          const [rows] = await connection.execute(sql);
          
          return rows as Promise<ISelectAllUsersQueryResultItem[]>;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(\`Error executing query: \${sql}\`, error);
          throw error;
        }
      }
      `,
    );
  });

  it('should create the type when querying a one to many relation', async () => {
    const queryName = 'selectAllUsersWithPosts';
    const sqlFn = generateSqlFnFromSql(
      ojotasConfig,
      queryName,
      "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id",
    );

    assertEqualIgnoreWhiteSpaces(
      sqlFn,
      `
      export const selectAllUsersWithPosts = (connection: mysql.Connection, assemble, ojotasConfig) => {
        const sql = "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id";
        try {
          const [rows] = await connection.execute(sql);
          
          return assemble(ojotasConfig.relations, ojotasConfig.aliases, ["u.name","p.title"], rows) as Promise<ISelectAllUsersWithPostsQueryResultItem[]>;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(\`Error executing query: \${sql}\`, error);
          throw error;
        }
      }
      `,
    );
  });
});
