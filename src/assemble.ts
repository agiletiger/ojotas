import { groupAliases } from './groupAliases';

const groupBy = (xs: Record<string, unknown>[], key: string) => {
  return xs.reduce((rv, x) => {
    // eslint-disable-next-line no-param-reassign
    // @ts-expect-error FIXME
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {}) as Record<string, Record<string, unknown>[]>;
};

export type Relations = Record<
  string,
  Record<string, ['hasMany' | 'hasOne', string]>
>;

export type AssembleFn = <T>(
  relations: Relations,
  aliases: Record<string, string>,
  identifiers: string[],
  objects: Record<string, unknown>[],
) => T[];

const removePrefixesFromKeys = (object) =>
  Object.entries(object).reduce((acc, [key, value]) => {
    const parts = key.split('.');
    acc[parts.length > 1 ? parts[1] : key] = value;
    return acc;
  }, {});

/**
 * Assembles objects based on relations, aliases and identifiers.
 *
 * @param {Object} relations - .
 * @param {Object} aliases - .
 * @param {Array} identifiers - Let us know when two different objects are part of the same.
 * @param {Array} objects - What we are going to assemble.
 * @returns {Array} The assembled result.
 */
export const assemble: AssembleFn = <T>(
  relations: Relations,
  aliases: Record<string, string>,
  identifiers: string[],
  objects: Record<string, unknown>[],
): T[] => {
  const identifier = identifiers.shift();
  const childIdentifier = identifiers[0];
  const childPrefix = childIdentifier?.split('.')[0];
  if (!identifier) {
    return objects as T[];
  }
  const partialAssemblies = Object.values(groupBy(objects, identifier));

  return partialAssemblies
    .map((a) => {
      const g = a.map(groupAliases);
      const parent = g[0][0];
      // discarding head bc it is always the same as parent
      const rest = g.map(([, ...tail]) => tail).flat() as Record<
        string,
        unknown
      >[];

      if (rest.length === 0) return parent;

      const children = assemble(relations, aliases, [...identifiers], rest);

      const parentPrefix = Object.keys(parent)[0].split('.')[0];
      const parentRelations = relations[aliases[parentPrefix]];

      const childName = aliases[childPrefix];
      const parentChildRelation = parentRelations[childName];

      children.forEach((child) => {
        if (parentChildRelation[0] === 'hasMany') {
          parent[parentChildRelation[1]] ??= [];
          if (child[childIdentifier.split('.')[1]] !== null) {
            parent[parentChildRelation[1]].push(child);
          }
        }
      });

      return parent;
    })
    .map(removePrefixesFromKeys) as T[];
};
