import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import { aliasify } from './aliasify';

describe('aliasify', () => {
  it('should do nothing when selecting * from one table', () => {
    assert.equal(aliasify('select * from users'), 'SELECT * FROM `users`');
  });

  it('should alias when there are no aliases present in query', () => {
    assert.equal(
      aliasify(
        'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
      ),
      'SELECT `u`.`name` AS `u.name`, `p`.`title` AS `p.title`, `p`.`content` AS `p.content` FROM `users` AS `u` INNER JOIN `posts` AS `p` ON `u`.`id` = `p`.`user_id`',
    );
  });
});
