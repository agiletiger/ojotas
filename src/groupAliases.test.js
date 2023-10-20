import assert from 'node:assert';
import test from 'node:test';

import groupAliases from './groupAliases.js';

test('groupAliases no aliases', () => {
  const object = { a: 1, b: 2 };

  assert.deepStrictEqual(groupAliases(object), [{ a: 1, b: 2 }]);
});

test('groupAliases one alias', () => {
  const object = { 'a.a': 1, 'a.b': 2 };

  assert.deepStrictEqual(groupAliases(object), [{ 'a.a': 1, 'a.b': 2 }]);
});

test('groupAliases two aliases', () => {
  const object = { 'a.a': 1, 'a.b': 2, 'c.d': 3, 'c.e': 4 };

  assert.deepStrictEqual(groupAliases(object), [
    { 'a.a': 1, 'a.b': 2 },
    { 'c.d': 3, 'c.e': 4 },
  ]);
});
