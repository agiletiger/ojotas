import { describe, it } from '../test/test-utils';
import assert from 'node:assert';

import { getParamsFromAst } from './getParamsFromAst';
import { astify } from './parser';
import { Dialect } from './orm';

// TODO: use fast-check here to generate more combinations
describe('getParamsFromAst', () => {
  describe('select', () => {
    it.each([
      { dialect: 'mysql' as Dialect },
      { dialect: 'postgres' as Dialect },
    ])('$dialect - should return empty when no params', ({ dialect }) => {
      assert.deepEqual(
        getParamsFromAst(astify(dialect, 'select id, name from users')),
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
          getParamsFromAst(
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
          getParamsFromAst(
            astify(
              dialect,
              'select id, name from users where name like :name?',
            ),
          ),
          [{ name: 'name', optional: true, table: 'users', column: 'name' }],
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
          getParamsFromAst(
            astify(
              dialect,
              'select id, name from users where name like :name? and id > :id?',
            ),
          ),
          [
            { name: 'name', optional: true, table: 'users', column: 'name' },
            { name: 'id', optional: true, table: 'users', column: 'id' },
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
          getParamsFromAst(
            astify(dialect, 'select id, name from users where name like :name'),
          ),
          [{ name: 'name', optional: false, table: 'users', column: 'name' }],
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
          getParamsFromAst(
            astify(
              dialect,
              'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id where p.title like :title',
            ),
          ),
          [{ name: 'title', optional: false, table: 'posts', column: 'title' }],
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
          getParamsFromAst(
            astify(
              dialect,
              'select id, name from users where name like :name and id > :id',
            ),
          ),
          [
            { name: 'name', optional: false, table: 'users', column: 'name' },
            { name: 'id', optional: false, table: 'users', column: 'id' },
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
          getParamsFromAst(
            astify(
              dialect,
              'select id, name from users where name like :name and id > :id or age < :age?',
            ),
          ),
          [
            { name: 'name', optional: false, table: 'users', column: 'name' },
            { name: 'id', optional: false, table: 'users', column: 'id' },
            { name: 'age', optional: true, table: 'users', column: 'age' },
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
        getParamsFromAst(
          astify(
            dialect,
            'INSERT INTO users (name, email, age) VALUES (:name, :email, :age)',
          ),
        ),
        [
          { name: 'name', optional: false, table: 'users', column: 'name' },
          { name: 'email', optional: false, table: 'users', column: 'email' },
          { name: 'age', optional: false, table: 'users', column: 'age' },
        ],
      );
    });

    it('mysql - should detect unnamed params in values', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify(
            'mysql',
            'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
          ),
        ),
        [
          { name: 'name', optional: false, table: 'users', column: 'name' },
          { name: 'email', optional: false, table: 'users', column: 'email' },
          { name: 'age', optional: false, table: 'users', column: 'age' },
        ],
      );
    });

    it('postgres - should detect unnamed params in values', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify(
            'postgres',
            'INSERT INTO users (name, email, age) VALUES ($1, $2, $3)',
          ),
        ),
        [
          { name: 'name', optional: false, table: 'users', column: 'name' },
          { name: 'email', optional: false, table: 'users', column: 'email' },
          { name: 'age', optional: false, table: 'users', column: 'age' },
        ],
      );
    });
  });
});
