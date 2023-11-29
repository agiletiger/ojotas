import { describe, it } from 'node:test';
import assert from 'node:assert';

import { astify, aliasify } from './parser';
import { Dialect } from './orm';

describe('parser', () => {
  const dialect = process.env.DIALECT as Dialect;

  describe('aliasify', () => {
    it(
      'mysql - should do nothing when selecting * from one table',
      { skip: dialect !== 'mysql' },
      () => {
        assert.equal(
          aliasify('mysql', astify('mysql', 'select * from users')),
          'SELECT * FROM `users`',
        );
      },
    );

    it(
      'postgres - should do nothing when selecting * from one table',
      { skip: dialect !== 'postgres' },
      () => {
        assert.equal(
          aliasify('postgres', astify('postgres', 'select * from users')),
          'SELECT * FROM "users"',
        );
      },
    );

    it(
      'mysql - should not add aliases when selecting from a single table',
      { skip: dialect !== 'mysql' },
      () => {
        assert.equal(
          aliasify('mysql', astify('mysql', 'select id, name from users')),
          'SELECT `id`, `name` FROM `users`',
        );
      },
    );

    it(
      'postgres - should not add aliases when selecting from a single table',
      { skip: dialect !== 'postgres' },
      () => {
        assert.equal(
          aliasify(
            'postgres',
            astify('postgres', 'select id, name from users'),
          ),
          'SELECT "id", "name" FROM "users"',
        );
      },
    );

    it(
      'mysql - should alias when there are no aliases present in query',
      { skip: dialect !== 'mysql' },
      () => {
        assert.equal(
          aliasify(
            'mysql',
            astify(
              'mysql',
              'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
            ),
          ),
          'SELECT `u`.`name` AS `u.name`, `p`.`title` AS `p.title`, `p`.`content` AS `p.content` FROM `users` AS `u` INNER JOIN `posts` AS `p` ON `u`.`id` = `p`.`user_id`',
        );
      },
    );

    it(
      'postgres - should alias when there are no aliases present in query',
      { skip: dialect !== 'postgres' },
      () => {
        assert.equal(
          aliasify(
            'postgres',
            astify(
              'postgres',
              'select u.name, p.title, p.content from users u inner join posts p on u.id = p.user_id',
            ),
          ),
          'SELECT "u"."name" AS "u.name", "p"."title" AS "p.title", "p"."content" AS "p.content" FROM "users" AS "u" INNER JOIN "posts" AS "p" ON "u"."id" = "p"."user_id"',
        );
      },
    );
  });
});
