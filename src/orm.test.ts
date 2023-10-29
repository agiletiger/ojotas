import { after, describe, before, it } from 'node:test';
import * as assert from 'node:assert';
import * as mysql from 'mysql2/promise';
import { query } from './orm';

describe('orm', async () => {
  let connection: mysql.Connection;
  before(async () => {
    const database = process.env.DB_NAME;

    const connectionOptions: mysql.ConnectionOptions = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };
    connection = await mysql.createConnection(connectionOptions);
    await connection.execute(`drop database if exists ${database};`);
    await connection.execute(`create database ${database};`);
    connection.changeUser({ database });
    try {
      await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        PRIMARY KEY (id)
      );
    `);
      await connection.execute(`
      CREATE TABLE posts (
        id INT AUTO_INCREMENT,
        user_id INT,
        title VARCHAR(100),
        content TEXT,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
      await connection.execute(`
      INSERT INTO users (id, name) 
      VALUES (1, 'Nico'), (2, 'Ivan'), (3, 'Diego');
    `);
      await connection.execute(`
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
    const res = await query(connection, 'select * from users', []);
    assert.deepStrictEqual(res, [
      { id: 1, name: 'Nico' },
      { id: 2, name: 'Ivan' },
      { id: 3, name: 'Diego' },
    ]);
  });

  it('should work for query without relations using select with columns list', async () => {
    const res = await query(connection, 'select id, name from users', []);
    assert.deepStrictEqual(res, [
      { id: 1, name: 'Nico' },
      { id: 2, name: 'Ivan' },
      { id: 3, name: 'Diego' },
    ]);
  });

  it('should work for query with relations (inner join)', async () => {
    const res = await query(
      connection,
      "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id",
      ['u.name', 'p.title'],
    );
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

  it('should work for query with relations (left join)', async () => {
    const res = await query(
      connection,
      "select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u left join posts p on u.id = p.user_id",
      ['u.name', 'p.title'],
    );
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
      { name: 'Diego', posts: [] },
    ]);
  });
});
