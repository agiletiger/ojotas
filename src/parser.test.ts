import { describe, it } from 'node:test';
import assert from 'node:assert';

import { astify, aliasify } from './parser';

describe('parser', () => {
  describe('aliasify', () => {
    it('should do nothing when selecting * from one table', () => {
      assert.equal(
        aliasify(astify('select * from users')),
        'SELECT * FROM `users`',
      );
    });

    it('should not add aliases when selecting from a single table', () => {
      assert.equal(
        aliasify(astify('select id, name from users')),
        'SELECT `id`, `name` FROM `users`',
      );
    });

    it('should alias when there are no aliases present in query', () => {
      assert.equal(
        aliasify(
          astify(
            'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
          ),
        ),
        'SELECT `u`.`name` AS `u.name`, `p`.`title` AS `p.title`, `p`.`content` AS `p.content` FROM `users` AS `u` INNER JOIN `posts` AS `p` ON `u`.`id` = `p`.`user_id`',
      );
    });
  });
});
