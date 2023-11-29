import { after, describe, before, it } from 'node:test';
import assert from 'node:assert';
import { query, Descriptor, Connection } from '../../src/orm';
import { getConnection } from '../../src/getConnection';
import { getTestConfigStatements } from '../helpers/getTestConfigStatements';

interface ISelectUsersQueryResultItem {
  id: string;
  name: string;
}

interface ISelectUsersWithPostsQueryResultItem {
  id: string;
  name: string;
  posts: Array<{
    title: string;
    content: string;
  }>;
}

describe('orm', async () => {
  let connection: Connection;
  before(async () => {
    connection = await getConnection(
      process.env.DIALECT as 'mysql' | 'postgres' | undefined,
    );
    const statements = getTestConfigStatements();
    for await (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  });

  after(() => {
    connection.destroy();
  });

  it('should work for query without relations using select *', async () => {
    const descriptor: Descriptor<ISelectUsersQueryResultItem> = () => ({
      sql: 'select * from users',
      params: null,
      identifiers: [],
      cast: (rows: unknown) => {
        return rows as ISelectUsersQueryResultItem[];
      },
    });

    const res = await query(connection, descriptor);
    assert.deepStrictEqual(res, [
      { id: 1, name: 'Nico' },
      { id: 2, name: 'Ivan' },
      { id: 3, name: 'Diego' },
    ]);
  });

  it('should work for query without relations using select with columns list', async () => {
    const descriptor: Descriptor<ISelectUsersQueryResultItem> = () => ({
      sql: 'select id, name from users',
      params: null,
      identifiers: [],
      cast: (rows: unknown) => {
        return rows as ISelectUsersQueryResultItem[];
      },
    });

    const res = await query(connection, descriptor);
    assert.deepStrictEqual(res, [
      { id: 1, name: 'Nico' },
      { id: 2, name: 'Ivan' },
      { id: 3, name: 'Diego' },
    ]);
  });

  it('should work for query with relations (inner join)', async () => {
    const descriptor: Descriptor<
      ISelectUsersWithPostsQueryResultItem
    > = () => ({
      sql: 'select u.name as "u.name", p.title as "p.title", p.content as "p.content" from users u inner join posts p on u.id = p.user_id',
      params: null,
      identifiers: ['u.name', 'p.title'],
      cast: (rows: unknown) => {
        return rows as ISelectUsersWithPostsQueryResultItem[];
      },
    });

    const res = await query(connection, descriptor);
    assert.deepStrictEqual(res, [
      {
        name: 'Nico',
        posts: [
          { title: 'Nico First Post', content: 'a' },
          { title: 'Nico Second Post', content: 'b' },
        ],
      },
      {
        name: 'Ivan',
        posts: [{ title: 'Ivan Third Post', content: 'c' }],
      },
    ]);
  });
});
