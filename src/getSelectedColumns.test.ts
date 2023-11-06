import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import { getSelectedColumns } from './getSelectedColumns';

describe('getSelectedColumns', () => {
  it('should work for a single table', () => {
    assert.deepEqual(getSelectedColumns('select u.id, u.name from users u'), {
      users: ['id', 'name'],
    });
  });

  it('should work for two tables', () => {
    assert.deepEqual(
      getSelectedColumns(
        'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
      ),
      {
        users: ['name'],
        posts: ['title', 'content'],
      },
    );
  });
});
