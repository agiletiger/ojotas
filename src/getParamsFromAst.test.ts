import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import { getParamsFromAst } from './getParamsFromAst';
import { astify } from './parser';

// TODO: use fast-check here to generate more combinations
describe('getParamsFromAst', () => {
  describe('select', () => {
    it('should return empty when no params', () => {
      assert.deepEqual(
        getParamsFromAst(astify('select id, name from users')),
        [],
      );
    });

    it('should throw error if querying from multiple tables and not using aliases', () => {
      assert.throws(() =>
        getParamsFromAst(
          astify(
            'select id, name from users join posts on users.id = posts.user_id where name like :name',
          ),
        ),
      );
    });

    it('should detect optional param in where statement', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify('select id, name from users where name like :name?'),
        ),
        [{ name: 'name', optional: true, table: 'users', column: 'name' }],
      );
    });

    it('should detect many optional params in where statement', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify(
            'select id, name from users where name like :name? and id > :id?',
          ),
        ),
        [
          { name: 'name', optional: true, table: 'users', column: 'name' },
          { name: 'id', optional: true, table: 'users', column: 'id' },
        ],
      );
    });

    it('should detect mandatory param in where statement', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify('select id, name from users where name like :name'),
        ),
        [{ name: 'name', optional: false, table: 'users', column: 'name' }],
      );
    });

    it('should detect mandatory param in where statement after a join', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify(
            'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id where p.title like :title',
          ),
        ),
        [{ name: 'title', optional: false, table: 'posts', column: 'title' }],
      );
    });

    it('should detect many mandatory params in where statement', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify(
            'select id, name from users where name like :name and id > :id',
          ),
        ),
        [
          { name: 'name', optional: false, table: 'users', column: 'name' },
          { name: 'id', optional: false, table: 'users', column: 'id' },
        ],
      );
    });

    it('should detect mixed params in where statement', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify(
            'select id, name from users where name like :name and id > :id or age < :age?',
          ),
        ),
        [
          { name: 'name', optional: false, table: 'users', column: 'name' },
          { name: 'id', optional: false, table: 'users', column: 'id' },
          { name: 'age', optional: true, table: 'users', column: 'age' },
        ],
      );
    });
  });

  describe('insert', () => {
    it('should detect named params in values', () => {
      assert.deepEqual(
        getParamsFromAst(
          astify(
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
  });
});
