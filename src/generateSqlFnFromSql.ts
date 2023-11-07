import { getSelectedColumns } from './getSelectedColumns';
import { Relations } from './assemble';
import { getResultTypeName } from './getResultTypeName';
import { aliasify } from './aliasify';
import * as fs from 'node:fs';

const invertObject = (
  object: Record<string, string>,
): Record<string, string> => {
  const invertedObject: Record<string, string> = {};
  for (const key in object) {
    // eslint-disable-next-line no-prototype-builtins
    if (object.hasOwnProperty(key)) {
      invertedObject[object[key]] = key;
    }
  }
  return invertedObject;
};

export const generateSqlFnFromSql = (
  ojotasConfig: { aliases: Record<string, string>; relations: Relations },
  queryName: string,
  sql: string,
) => {
  const selectedColumns = getSelectedColumns(sql);
  if (Object.keys(selectedColumns).length > 1) {
    const tablesToAliases = invertObject(ojotasConfig.aliases);
    // MVP: for now when selecting from multiple tables we will take the fists column of each as its identifier
    // so we can do the assemble
    const identifiers = Object.entries(selectedColumns).map(
      ([table, columns]) => `${tablesToAliases[table]}.${columns[0]}`,
    );

    return fs
      .readFileSync('./src/templates/assemble-no-params.ts')
      .toString()
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(sql))
      .replace('$identifiers$', JSON.stringify(identifiers))
      .replace('$returnTypeName$', getResultTypeName(queryName))
      .replace('// @ts-nocheck', '');
  } else {
    return fs
      .readFileSync('./src/templates/no-assemble-no-params.ts')
      .toString()
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(sql))
      .replace('$returnTypeName$', getResultTypeName(queryName))
      .replace('// @ts-nocheck', '');
  }
};
