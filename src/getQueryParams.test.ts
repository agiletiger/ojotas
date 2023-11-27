import { describe, it } from '../test/test-utils';
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

  describe('select', () => {
    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])('$dialect - should return empty when no params', ({ dialect }) => {
      assert.deepEqual(
        getQueryParams(
          modelTypes,
          astify(dialect, 'select id, name from users'),
        ),
        [],
      );
    });

    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])(
      '$dialect - should throw error if querying from multiple tables and not using aliases',
      ({ dialect }) => {
        assert.throws(() =>
          getQueryParams(
            modelTypes,
            astify(
              dialect,
              'select id, name from users join posts on users.id = posts.user_id where name like :name',
            ),
          ),
        );
      },
    );

    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])(
      '$dialect - should detect optional param in where statement',
      ({ dialect }) => {
        assert.deepEqual(
          getQueryParams(
            modelTypes,
            astify(
              dialect,
              'select id, name from users where name like :name?',
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
          ],
        );
      },
    );

    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])(
      '$dialect - should detect many optional params in where statement',
      ({ dialect }) => {
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
      },
    );

    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])(
      '$dialect - should detect mandatory param in where statement',
      ({ dialect }) => {
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
      },
    );

    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])(
      '$dialect - should detect mandatory param in where statement after a join',
      ({ dialect }) => {
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
      },
    );

    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])(
      '$dialect - should detect many mandatory params in where statement',
      ({ dialect }) => {
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
      },
    );

    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])(
      '$dialect - should detect mixed params in where statement',
      ({ dialect }) => {
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
      },
    );
  });

  describe('insert', () => {
    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])('$dialect - should detect named params in values', ({ dialect }) => {
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

    it('mysql - should detect unnamed params in values', () => {
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
    });

    it('postgres - should detect unnamed params in values', () => {
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
    });
  });
});
