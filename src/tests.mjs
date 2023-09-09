import assert from 'node:assert';
import test from 'node:test';
import 'core-js';

const groupAliases = (object) => {
  const result = {};

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in object) {
    const group = key.includes('.') ? key.split('.')[0] : '';
    result[group] ??= {};
    result[group][key] = object[key];
  }

  return Object.values(result);
};

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

/**
 * Assembles the query result based on identifiers and relations.
 *
 * @param {Array} queryResult - The result of the query.
 * @param {Array} identifiers - The identifiers to be used in the assembly.
 * @param {Object} relations - The relations to be used in the assembly.
 * @returns {Array} The assembled query result.
 */
const assembleQueryResult = (queryResult, identifiers, relations) => {
  const identifier = identifiers.shift();
  if (!identifier) {
    return queryResult;
  }
  const partialAssemblies = Object.values(
    Object.groupBy(queryResult, (o) => o[identifier]),
  );

  return [].concat(
    ...partialAssemblies.map((a) =>
      assembleQueryResult(a, identifiers, relations),
    ),
  );
};

test('assemble no aliases', () => {
  const queryResult = [{ jobNumber: 1 }, { jobNumber: 2 }];

  const identifiers = ['jobNumber'];
  const relations = {};

  const assemble = [{ jobNumber: 1 }, { jobNumber: 2 }];

  assert.deepStrictEqual(
    assembleQueryResult(queryResult, identifiers, relations),
    assemble,
  );
});

test('assemble with aliases', () => {
  const queryResult = [{ 'j.jobNumber': 1 }, { 'j.jobNumber': 2 }];

  const identifiers = ['jobNumber'];
  const relations = {};

  assert.deepStrictEqual(
    assembleQueryResult(queryResult, identifiers, relations),
    [{ 'j.jobNumber': 1 }, { 'j.jobNumber': 2 }],
  );
});

test.skip('assemble hasMany single props', () => {
  const queryResult = [
    { 'j.jobNumber': 1, 'jl.locationId': 1 },
    { 'j.jobNumber': 1, 'jl.locationId': 2 },
    { 'j.jobNumber': 2, 'jl.locationId': 3 },
  ];

  const identifiers = ['jobNumber', 'locationId'];
  const relations = {
    job: {
      hasMany: ['job_location', 'locations'],
    },
  };

  assert.deepStrictEqual(
    assembleQueryResult(queryResult, identifiers, relations),
    [
      { jobNumber: 1, locations: [{ locationId: 1 }, { locationId: 2 }] },
      { jobNumber: 2, locations: [{ locationId: 3 }] },
    ],
  );
});
