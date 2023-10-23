import groupAliases from './groupAliases.js';

const groupBy = (xs, key) => {
  return xs.reduce((rv, x) => {
    // eslint-disable-next-line no-param-reassign
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

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
  const childIdentifier = identifiers[0];
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
        if (child[childIdentifier] !== null) {
          parent[parentChildRelation[1]].push(child);
        }
      }
    });

    return parent;
  });
};

export default assemble;
