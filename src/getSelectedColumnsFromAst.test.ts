import { describe, it } from '../test/test-utils';
import assert from 'node:assert';

import {
  SchemaTypes,
  getSelectedColumnsFromAst,
} from './getSelectedColumnsFromAst';
import { astify } from './parser';
import { Dialect } from './orm';

describe('getSelectedColumnsFromAst', () => {
  const types: SchemaTypes = {
    users: {
      id: { tsType: 'number', nullable: false },
      name: { tsType: 'string', nullable: false },
    },
    posts: {
      content: { tsType: 'string', nullable: true },
      id: { tsType: 'number', nullable: false },
      title: { tsType: 'string', nullable: true },
      user_id: { tsType: 'number', nullable: true },
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
      getSelectedColumnsFromAst(
        types,
        astify(dialect, 'select u.id, u.name from users u'),
      ),
      {
        users: [
          {
            column: 'id',
            nullable: false,
            type: 'number',
          },
          {
            column: 'name',
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
      getSelectedColumnsFromAst(
        types,
        astify(
          dialect,
          'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
        ),
      ),
      {
        users: [{ column: 'name', nullable: false, type: 'string' }],
        posts: [
          { column: 'title', nullable: true, type: 'string' },
          { column: 'content', nullable: true, type: 'string' },
        ],
      },
    );
  });

  it('postgres - should support returning in update statements', () => {
    assert.deepEqual(
      getSelectedColumnsFromAst(
        types,
        astify(
          'postgres',
          'update users set name = "nico" where id = 1 returning id',
        ),
      ),
      {
        users: [{ column: 'id', nullable: false, type: 'number' }],
      },
    );
  });

  it('postgres - should support returning in insert statements', () => {
    assert.deepEqual(
      getSelectedColumnsFromAst(
        types,
        astify(
          'postgres',
          'insert into users (name) values ("eze") returning id',
        ),
      ),
      {
        users: [{ column: 'id', nullable: false, type: 'number' }],
      },
    );
  });
});
