import { describe, it } from '../test/test-utils';
import assert from 'node:assert';

import { getSelectedColumnsFromAst } from './getSelectedColumnsFromAst';
import { astify } from './parser';
import { Dialect } from './orm';

describe('getSelectedColumnsFromAst', () => {
  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])('$dialect - should work for a single table', ({ dialect }) => {
    assert.deepEqual(
      getSelectedColumnsFromAst(
        astify(dialect, 'select u.id, u.name from users u'),
      ),
      {
        users: ['id', 'name'],
      },
    );
  });

  it.each([
    { dialect: 'mysql' as Dialect },
    { dialect: 'postgres' as Dialect },
  ])('$dialect - should work for two tables', ({ dialect }) => {
    assert.deepEqual(
      getSelectedColumnsFromAst(
        astify(
          dialect,
          'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
        ),
      ),
      {
        users: ['name'],
        posts: ['title', 'content'],
      },
    );
  });

  it('postgres - should support returning in update statements', () => {
    assert.deepEqual(
      getSelectedColumnsFromAst(
        astify(
          'postgres',
          'update users set name = "nico" where id = 1 returning id',
        ),
      ),
      {
        users: ['id'],
      },
    );
  });
});
