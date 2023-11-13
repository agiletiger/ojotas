import { getSelectedColumnsFromAst } from './getSelectedColumnsFromAst';
import { Relations } from './assemble';
import { getReturnTypeName } from './getReturnTypeName';
import * as fs from 'node:fs';
import { AST, aliasify } from './parser';
import { getParamsFromAst } from './getParamsFromAst';
import * as path from 'node:path';
import { getParamsTypeName } from './getParamsTypeName';

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
  rootPath: string, // I'm passing this so same function can work with local tests and inside node_modules. Not sure this is the right way..
  ojotasConfig: { aliases: Record<string, string>; relations: Relations },
  queryName: string,
  ast: AST,
) => {
  const assembleNoParams = fs
    .readFileSync(path.join(rootPath, '../templates/assemble-no-params.ts'))
    .toString();
  const assembleParams = fs
    .readFileSync(path.join(rootPath, '../templates/assemble-params.ts'))
    .toString();
  const noAssembleNoParams = fs
    .readFileSync(path.join(rootPath, '../templates/no-assemble-no-params.ts'))
    .toString();
  const noAssembleParams = fs
    .readFileSync(path.join(rootPath, '../templates/no-assemble-params.ts'))
    .toString();

  const selectedColumns = getSelectedColumnsFromAst(ast);
  // TODO: refactor. getParamsFromAst is also called in codegen
  const params = getParamsFromAst(ast);
  if (Object.keys(selectedColumns).length > 1) {
    const tablesToAliases = invertObject(ojotasConfig.aliases);
    // MVP: for now when selecting from multiple tables we will take the fists column of each as its identifier
    // so we can do the assemble
    const identifiers = Object.entries(selectedColumns).map(
      ([table, columns]) => `${tablesToAliases[table]}.${columns[0]}`,
    );

    const template = params.length ? assembleParams : assembleNoParams;
    return template
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(ast))
      .replace('$identifiers$', JSON.stringify(identifiers))
      .replace('$paramsTypeName$', getParamsTypeName(queryName))
      .replace('$returnTypeName$', getReturnTypeName(queryName))
      .replace('// @ts-nocheck', '');
  } else {
    const template = params.length ? noAssembleParams : noAssembleNoParams;
    return template
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(ast))
      .replace('$paramsTypeName$', getParamsTypeName(queryName))
      .replace('$returnTypeName$', getReturnTypeName(queryName))
      .replace('// @ts-nocheck', '');
  }
};
