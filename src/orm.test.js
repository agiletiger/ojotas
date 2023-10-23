import { after, describe, before, it }  from 'node:test';
import assert from 'node:assert';
import mysql from 'mysql2/promise';
 import { complexQuery, simpleQuery } from './orm.js';

describe('orm', async () => {
  let connection = null;
  before(async () => {
    const connectionOptions = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };
    connection = await mysql.createConnection(connectionOptions);
    await connection.execute('drop database if exists ojotas;');
    await connection.execute('create database ojotas;');
    connection.changeUser({database: process.env.DB_NAME})
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
      e;
    }
  });

  after(() => {
    connection.destroy();
  });

  it('should work for query without relations', async () => {
    const res = await simpleQuery('select * from users', connection)
    assert.deepStrictEqual(res, [
      { id: 1, name: 'Nico' },
      { id: 2, name: 'Ivan' },
      { id: 3, name: 'Diego' }
    ])
  });

  it('should work for query with relations (inner join)', async () => {
    const res = await complexQuery("select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u inner join posts p on u.id = p.user_id", connection)
    assert.deepStrictEqual(res, [
      { 'u.name': 'Nico', posts: [{'p.title': 'Nico First Post', 'p.content': 'a'}, {'p.title': 'Nico Second Post', 'p.content': 'b'}] },
      { 'u.name': 'Ivan', posts: [{'p.title': 'Ivan Third Post', 'p.content': 'c'}]  },
    ])
  });

  it('should work for query with relations (left join)', async () => {
    const res = await complexQuery("select u.name as 'u.name', p.title as 'p.title', p.content as 'p.content' from users u left join posts p on u.id = p.user_id", connection)
    assert.deepStrictEqual(res, [
      { 'u.name': 'Nico', posts: [{'p.title': 'Nico First Post', 'p.content': 'a'}, {'p.title': 'Nico Second Post', 'p.content': 'b'}] },
      { 'u.name': 'Ivan', posts: [{'p.title': 'Ivan Third Post', 'p.content': 'c'}]  },
      { 'u.name': 'Diego', posts: [] }
    ])
  });
}); 
