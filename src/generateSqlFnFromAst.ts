import { getSelectedColumnsFromAst } from './getSelectedColumnsFromAst';
import { Relations } from './assemble';
import { getReturnTypeName } from './getReturnTypeName';
import * as fs from 'node:fs';
import { AST, aliasify } from './parser';

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

export const generateSqlFnFromAst = (
  ojotasConfig: { aliases: Record<string, string>; relations: Relations },
  queryName: string,
  ast: AST,
) => {
  const selectedColumns = getSelectedColumnsFromAst(ast);
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
      .replace('$sql$', aliasify(ast))
      .replace('$identifiers$', JSON.stringify(identifiers))
      .replace('$returnTypeName$', getReturnTypeName(queryName))
      .replace('// @ts-nocheck', '');
  } else {
    return fs
      .readFileSync('./src/templates/no-assemble-no-params.ts')
      .toString()
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(ast))
      .replace('$returnTypeName$', getReturnTypeName(queryName))
      .replace('// @ts-nocheck', '');
  }
};