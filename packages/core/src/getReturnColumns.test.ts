import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getReturnColumns } from './getReturnColumns';
import { astify } from './parser';
import { Dialect } from './orm';
import { ModelTypes } from './mapSqlTypeToTsType';

describe('getReturnColumns', () => {
  const modelTypes: ModelTypes = {
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

  const dialect = process.env.DIALECT as Dialect;

  it('should work for a single table', () => {
    assert.deepEqual(
      getReturnColumns(
        modelTypes,
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

  it('should work for two tables', () => {
    assert.deepEqual(
      getReturnColumns(
        modelTypes,
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

  it(
    'postgres - should support returning in update statements',
    { skip: dialect !== 'postgres' },
    () => {
      assert.deepEqual(
        getReturnColumns(
          modelTypes,
          astify(
            'postgres',
            'update users set name = "nico" where id = 1 returning id',
          ),
        ),
        {
          users: [{ name: 'id', nullable: false, type: 'number' }],
        },
      );
    },
  );

  it(
    'postgres - should support returning in insert statements',
    { skip: dialect !== 'postgres' },
    () => {
      assert.deepEqual(
        getReturnColumns(
          modelTypes,
          astify(
            'postgres',
            'insert into users (name) values ("eze") returning id',
          ),
        ),
        {
          users: [{ name: 'id', nullable: false, type: 'number' }],
        },
      );
    },
  );
});
