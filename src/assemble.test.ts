import * as assert from 'node:assert';
import test from 'node:test';
import { Relations, assemble } from './assemble';

test('assemble', () => {
  const objects = [{ 'j.jobNumber': 1 }, { 'j.jobNumber': 2 }];

  const relations = {};
  const aliases = {};
  const identifiers = ['j.jobNumber'];

  assert.deepStrictEqual(assemble(relations, aliases, identifiers, objects), [
    { jobNumber: 1 },
    { jobNumber: 2 },
  ]);
});

test('assemble hasMany single props', () => {
  const objects = [
    { 'j.jobNumber': 1, 'jl.locationId': 1 },
    { 'j.jobNumber': 1, 'jl.locationId': 2 },
    { 'j.jobNumber': 2, 'jl.locationId': 3 },
  ];

  const relations: Relations = {
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
      jobNumber: 1,
      locations: [{ locationId: 1 }, { locationId: 2 }],
    },
    { jobNumber: 2, locations: [{ locationId: 3 }] },
  ]);
});

test('assemble hasMany null', () => {
  const objects = [
    { 'j.jobNumber': 1, 'jl.locationId': 1 },
    { 'j.jobNumber': 1, 'jl.locationId': 2 },
    { 'j.jobNumber': 2, 'jl.locationId': null },
  ];

  const relations: Relations = {
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
      jobNumber: 1,
      locations: [{ locationId: 1 }, { locationId: 2 }],
    },
    { jobNumber: 2, locations: [] },
  ]);
});

test('assemble hasOne relationship', () => {
  const objects = [
    { 'p.personId': 1, 'c.contactId': 101 },
    { 'p.personId': 2, 'c.contactId': 102 },
  ];

  const relations: Relations = {
    person: {
      contact: ['hasOne', 'contactDetails'],
    },
  };
  const aliases = {
    p: 'person',
    c: 'contact',
  };
  const identifiers = ['p.personId', 'c.contactId'];

  assert.deepStrictEqual(assemble(relations, aliases, identifiers, objects), [
    { personId: 1, contactDetails: { contactId: 101 } },
    { personId: 2, contactDetails: { contactId: 102 } },
  ]);
});

test('assemble hasOne relationship with null', () => {
  const objects = [
    { 'p.personId': 1, 'c.contactId': 101 },
    { 'p.personId': 2, 'c.contactId': null },
  ];

  const relations: Relations = {
    person: {
      contact: ['hasOne', 'contactDetails'],
    },
  };
  const aliases = {
    p: 'person',
    c: 'contact',
  };
  const identifiers = ['p.personId', 'c.contactId'];

  assert.deepStrictEqual(assemble(relations, aliases, identifiers, objects), [
    { personId: 1, contactDetails: { contactId: 101 } },
    { personId: 2, contactDetails: null },
  ]);
});
