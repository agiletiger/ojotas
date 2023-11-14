import { describe, it } from 'node:test';
import * as assert from 'node:assert';

import { generateSqlBuilderFromAst } from './generateSqlBuilderFromAst';
import { astify } from './parser';

// TODO: use fast-check here to generate more combinations
describe.skip('generateSqlBuilderFromAst', () => {
  it('should return empty when no params', () => {
    assert.equal(
      generateSqlBuilderFromAst(
        astify(
          'select id, name from users where name like :name and id > :id or age < :age?',
        ),
      ),
      '',
    );
  });
});
