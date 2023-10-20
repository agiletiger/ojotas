import assert from 'node:assert';
import test from 'node:test';

import assemble from './assemble.js';

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
