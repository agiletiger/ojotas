import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import { getParamsFromSql } from './getParamsFromSql';

// TODO: use fast-check here to generate more combinations
describe('getParamsFromSql', () => {
  it('should return empty when no params', () => {
    assert.deepEqual(getParamsFromSql('select id, name from users'), []);
  });

  it('should throw error if querying from multiple tables and not using aliases', () => {
    assert.throws(() =>
      getParamsFromSql(
        'select id, name from users join posts on users.id = posts.user_id where name like :name',
      ),
    );
  });

  it('should detect optional param in where statement', () => {
    assert.deepEqual(
      getParamsFromSql('select id, name from users where name like :name?'),
      [{ name: 'name', optional: true, table: 'users', column: 'name' }],
    );
  });

  it('should detect many optional params in where statement', () => {
    assert.deepEqual(
      getParamsFromSql(
        'select id, name from users where name like :name? and id > :id?',
      ),
      [
        { name: 'name', optional: true, table: 'users', column: 'name' },
        { name: 'id', optional: true, table: 'users', column: 'id' },
      ],
    );
  });

  it('should detect mandatory param in where statement', () => {
    assert.deepEqual(
      getParamsFromSql('select id, name from users where name like :name'),
      [{ name: 'name', optional: false, table: 'users', column: 'name' }],
    );
  });

  it('should detect many mandatory params in where statement', () => {
    assert.deepEqual(
      getParamsFromSql(
        'select id, name from users where name like :name and id > :id',
      ),
      [
        { name: 'name', optional: false, table: 'users', column: 'name' },
        { name: 'id', optional: false, table: 'users', column: 'id' },
      ],
    );
  });

  it('should detect mixed params in where statement', () => {
    assert.deepEqual(
      getParamsFromSql(
        'select id, name from users where name like :name and id > :id or age < :age?',
      ),
      [
        { name: 'name', optional: false, table: 'users', column: 'name' },
        { name: 'id', optional: false, table: 'users', column: 'id' },
        { name: 'age', optional: true, table: 'users', column: 'age' },
      ],
    );
  });
});
