import assert from 'node:assert';
import test from 'node:test';

const groupBy = (xs, key) => {
  return xs.reduce((rv, x) => {
    // eslint-disable-next-line no-param-reassign
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

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
 * Assembles objects based on relations, aliases and identifiers.
 *
 * @param {Object} relations - .
 * @param {Object} aliases - .
 * @param {Array} identifiers - Let us know when two different objects are part of the same.
 * @param {Array} objects - What we are going to assemble.
 * @returns {Array} The assembled result.
 */
const assemble = (relations, aliases, identifiers, objects) => {
  const identifier = identifiers.shift();
  if (!identifier) {
    return objects;
  }
  const partialAssemblies = Object.values(groupBy(objects, identifier));

  return partialAssemblies.map((a) => {
    const g = a.map(groupAliases);
    const parent = g[0][0];
    // discarding head bc it is always the same as parent
    const rest = g.map(([, ...tail]) => tail).flat();

    if (rest.length === 0) return parent;

    const children = assemble(relations, aliases, identifiers, rest);

    const parentPrefix = Object.keys(parent)[0].split('.')[0];
    const parentRelations = relations[aliases[parentPrefix]];

    children.forEach((child) => {
      const childPrefix = Object.keys(child)[0].split('.')[0];
      const childName = aliases[childPrefix];

      const parentChildRelation = parentRelations[childName];
      if (parentChildRelation[0] === 'hasMany') {
        parent[parentChildRelation[1]] ??= [];
        parent[parentChildRelation[1]].push(child);
      }
    });

    return parent;
  });
};

test('assemble no aliases', () => {
  const objects = [{ jobNumber: 1 }, { jobNumber: 2 }];

  const relations = {};
  const aliases = {};
  const identifiers = ['jobNumber'];

  assert.deepStrictEqual(assemble(relations, aliases, identifiers, objects), [
    { jobNumber: 1 },
    { jobNumber: 2 },
  ]);
});

test('assemble with aliases', () => {
  const objects = [{ 'j.jobNumber': 1 }, { 'j.jobNumber': 2 }];

  const relations = {};
  const aliases = {};
  const identifiers = ['j.jobNumber'];

  assert.deepStrictEqual(assemble(relations, aliases, identifiers, objects), [
    { 'j.jobNumber': 1 },
    { 'j.jobNumber': 2 },
  ]);
});

test('assemble hasMany single props', () => {
  const objects = [
    { 'j.jobNumber': 1, 'jl.locationId': 1 },
    { 'j.jobNumber': 1, 'jl.locationId': 2 },
    { 'j.jobNumber': 2, 'jl.locationId': 3 },
  ];

  const relations = {
    job: {
      job_location: ['hasMany', 'locations'],
    },
  };
  const aliases = {
    j: 'job',
    jl: 'job_location',
  };
  const identifiers = ['j.jobNumber', 'jl.locationId'];

  assert.deepStrictEqual(assemble(relations, aliases, identifiers, objects), [
    {
      'j.jobNumber': 1,
      locations: [{ 'jl.locationId': 1 }, { 'jl.locationId': 2 }],
    },
    { 'j.jobNumber': 2, locations: [{ 'jl.locationId': 3 }] },
  ]);
});
