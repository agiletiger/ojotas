import { describe, it } from '../test/test-utils';
import assert from 'node:assert';

import { ModelTypes, getReturnColumns } from './getReturnColumns';
import { astify } from './parser';
import { Dialect } from './orm';

describe('getReturnColumns', () => {
  const types: ModelTypes = {
    users: {
      id: { type: 'number', nullable: false },
      name: { type: 'string', nullable: false },
    },
    posts: {
      content: { type: 'string', nullable: true },
      id: { type: 'number', nullable: false },
      title: { type: 'string', nullable: true },
      user_id: { type: 'number', nullable: true },
    },
  };

  it.each([
    {
      dialect: 'mysql' as Dialect,
    },
    {
      dialect: 'postgres' as Dialect,
    },
  ])('$dialect - should work for a single table', ({ dialect }) => {
    assert.deepEqual(
      getReturnColumns(
        types,
        astify(dialect, 'select u.id, u.name from users u'),
      ),
      {
        users: [
          {
            name: 'id',
            nullable: false,
            type: 'number',
          },
          {
            name: 'name',
            nullable: false,
            type: 'string',
          },
        ],
      },
    );
  });

  it.each([
    {
      dialect: 'mysql' as Dialect,
    },
    {
      dialect: 'postgres' as Dialect,
    },
  ])('$dialect - should work for two tables', ({ dialect }) => {
    assert.deepEqual(
      getReturnColumns(
        types,
        astify(
          dialect,
          'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
        ),
      ),
      {
        users: [{ name: 'name', nullable: false, type: 'string' }],
        posts: [
          { name: 'title', nullable: true, type: 'string' },
          { name: 'content', nullable: true, type: 'string' },
        ],
      },
    );
  });

  it('postgres - should support returning in update statements', () => {
    assert.deepEqual(
      getReturnColumns(
        types,
        astify(
          'postgres',
          'update users set name = "nico" where id = 1 returning id',
        ),
      ),
      {
        users: [{ name: 'id', nullable: false, type: 'number' }],
      },
    );
  });

  it('postgres - should support returning in insert statements', () => {
    assert.deepEqual(
      getReturnColumns(
        types,
        astify(
          'postgres',
          'insert into users (name) values ("eze") returning id',
        ),
      ),
      {
        users: [{ name: 'id', nullable: false, type: 'number' }],
      },
    );
  });
});
