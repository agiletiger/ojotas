import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getQueryParams } from './getQueryParams';
import { astify } from './parser';
import { Dialect } from './orm';
import { ModelTypes } from './mapSqlTypeToTsType';

// TODO: use fast-check here to generate more combinations
describe('getQueryParams', () => {
  const modelTypes: ModelTypes = {
    users: {
      id: { type: 'number', nullable: false },
      name: { type: 'string', nullable: false },
      email: { type: 'string', nullable: false },
      age: { type: 'number', nullable: false },
    },
    posts: {
      content: { type: 'string', nullable: true },
      id: { type: 'number', nullable: false },
      title: { type: 'string', nullable: true },
      user_id: { type: 'number', nullable: true },
    },
  };

  const dialect = process.env.DIALECT as Dialect;

  describe('select', () => {
    it('should return empty when no params', () => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(dialect, 'select id, name from users'),
        ),
        [],
      );
    });

    it('should throw error if querying from multiple tables and not using aliases', () => {
      assert.throws(() =>
        getQueryParams(
          modelTypes,
          astify(
            dialect,
            'select id, name from users join posts on users.id = posts.user_id where name like :name',
          ),
        ),
      );
    });

    it('should detect optional param in where statement', () => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(dialect, 'select id, name from users where name like :name?'),
        ),
        [
          {
            name: 'name',
            optional: true,
            table: 'users',
            column: 'name',
            type: 'string',
          },
        ],
      );
    });

    it('should detect many optional params in where statement', () => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(
            dialect,
            'select id, name from users where name like :name? and id > :id?',
          ),
        ),
        [
          {
            name: 'name',
            optional: true,
            table: 'users',
            column: 'name',
            type: 'string',
          },
          {
            name: 'id',
            optional: true,
            table: 'users',
            column: 'id',
            type: 'number',
          },
        ],
      );
    });

    it('should detect mandatory param in where statement', () => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(dialect, 'select id, name from users where name like :name'),
        ),
        [
          {
            name: 'name',
            optional: false,
            table: 'users',
            column: 'name',
            type: 'string',
          },
        ],
      );
    });

    it('should detect mandatory param in where statement after a join', () => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(
            dialect,
            'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id where p.title like :title',
          ),
        ),
        [
          {
            name: 'title',
            optional: false,
            table: 'posts',
            column: 'title',
            type: 'string',
          },
        ],
      );
    });

    it('should detect many mandatory params in where statement', () => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(
            dialect,
            'select id, name from users where name like :name and id > :id',
          ),
        ),
        [
          {
            name: 'name',
            optional: false,
            table: 'users',
            column: 'name',
            type: 'string',
          },
          {
            name: 'id',
            optional: false,
            table: 'users',
            column: 'id',
            type: 'number',
          },
        ],
      );
    });

    it('should detect mixed params in where statement', () => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(
            dialect,
            'select id, name from users where name like :name and id > :id or age < :age?',
          ),
        ),
        [
          {
            name: 'name',
            optional: false,
            table: 'users',
            column: 'name',
            type: 'string',
          },
          {
            name: 'id',
            optional: false,
            table: 'users',
            column: 'id',
            type: 'number',
          },
          {
            name: 'age',
            optional: true,
            table: 'users',
            column: 'age',
            type: 'number',
          },
        ],
      );
    });
  });

  describe('insert', () => {
    it('should detect named params in values', () => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(
            dialect,
            'INSERT INTO users (name, email, age) VALUES (:name, :email, :age)',
          ),
        ),
        [
          {
            name: 'name',
            optional: false,
            table: 'users',
            column: 'name',
            type: 'string',
          },
          {
            name: 'email',
            optional: false,
            table: 'users',
            column: 'email',
            type: 'string',
          },
          {
            name: 'age',
            optional: false,
            table: 'users',
            column: 'age',
            type: 'number',
          },
        ],
      );
    });

    it(
      'mysql - should detect unnamed params in values',
      { skip: dialect !== 'mysql' },
      () => {
        assert.deepEqual(
          getQueryParams(
            modelTypes,
            astify(
              'mysql',
              'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
            ),
          ),
          [
            {
              name: 'name',
              optional: false,
              table: 'users',
              column: 'name',
              type: 'string',
            },
            {
              name: 'email',
              optional: false,
              table: 'users',
              column: 'email',
              type: 'string',
            },
            {
              name: 'age',
              optional: false,
              table: 'users',
              column: 'age',
              type: 'number',
            },
          ],
        );
      },
    );

    it(
      'postgres - should detect unnamed params in values',
      { skip: dialect !== 'postgres' },
      () => {
        assert.deepEqual(
          getQueryParams(
            modelTypes,
            astify(
              'postgres',
              'INSERT INTO users (name, email, age) VALUES ($1, $2, $3)',
            ),
          ),
          [
            {
              name: 'name',
              optional: false,
              table: 'users',
              column: 'name',
              type: 'string',
            },
            {
              name: 'email',
              optional: false,
              table: 'users',
              column: 'email',
              type: 'string',
            },
            {
              name: 'age',
              optional: false,
              table: 'users',
              column: 'age',
              type: 'number',
            },
          ],
        );
      },
    );
  });
});
