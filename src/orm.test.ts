import { after, describe, before, it } from 'node:test';
import * as assert from 'node:assert';
import {
  query,
  Descriptor,
  Connection,
  createMySqlConnection,
  ConnectionOptions,
} from './orm';

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
    const connectionOptions: ConnectionOptions = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
    connection = await createMySqlConnection(connectionOptions);
    await connection.query(`drop table if exists posts;`);
    await connection.query(`drop table if exists users;`);
    try {
      await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        PRIMARY KEY (id)
      );
    `);
      await connection.query(`
      CREATE TABLE posts (
        id INT AUTO_INCREMENT,
        user_id INT,
        title VARCHAR(100),
        content TEXT,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
      await connection.query(`
      INSERT INTO users (id, name) 
      VALUES (1, 'Nico'), (2, 'Ivan'), (3, 'Diego');
    `);
      await connection.query(`
      INSERT INTO posts (user_id, title, content) 
      VALUES (1, 'Nico First Post', 'a'), (1, 'Nico Second Post', 'b'),
      (2, 'Ivan Third Post', 'c');
    `);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
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
      sql: "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id",
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
