import { getSelectedColumnsFromAst } from './getSelectedColumnsFromAst';
import { Relations } from './assemble';
import { getReturnTypeName } from './getReturnTypeName';
import * as fs from 'node:fs';
import { AST, aliasify } from './parser';
import { getParamsFromAst } from './getParamsFromAst';
import * as path from 'node:path';
import { getParamsTypeName } from './getParamsTypeName';
import { getIdentifiers } from './getIdentifiers';

export const generateSqlFnFromAst = (
  rootPath: string, // I'm passing this so same function can work with local tests and inside node_modules. Not sure this is the right way..
  ojotasConfig: { aliases: Record<string, string>; relations: Relations },
  queryName: string,
  ast: AST,
) => {
  const queryWithoutParams = fs
    .readFileSync(path.join(rootPath, '../templates/query-without-params.ts'))
    .toString();
  const queryWithParams = fs
    .readFileSync(path.join(rootPath, '../templates/query-with-params.ts'))
    .toString();

  const selectedColumns = getSelectedColumnsFromAst(ast);
  // TODO: refactor. getParamsFromAst is also called in codegen
  const params = getParamsFromAst(ast);
  const identifiers = getIdentifiers(ojotasConfig.aliases, selectedColumns);

  if (params.length) {
    return queryWithParams
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(ast))
      .replace('$identifiers$', JSON.stringify(identifiers))
      .replace('$paramsTypeName$', getParamsTypeName(queryName))
      .replace('$returnTypeName$', getReturnTypeName(queryName))
      .replace('// @ts-nocheck', '');
  } else {
    return queryWithoutParams
      .replace('$queryName$', queryName)
      .replace('$sql$', aliasify(ast))
      .replace('$identifiers$', JSON.stringify(identifiers))
      .replace('$returnTypeName$', getReturnTypeName(queryName))
      .replace('// @ts-nocheck', '');
  }
};
