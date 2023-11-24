import 'dotenv/config';

import { globSync } from 'fast-glob';
import fs from 'fs';
import path from 'path';

import { generateSqlFnFromAst } from './generateSqlFnFromAst';
import { generateReturnTypeFromAst } from './generateReturnTypeFromAst';
import { astify } from './parser';
import { generateParamsTypeFromAst } from './generateParamsTypeFromAst';
import { getTablesDefinition } from './getTablesDefinition';
import { getConnection } from './getConnection';

export const codegen = async (nodeModulePath: string, rootPath: string) => {
  const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

  const files = globSync(path.join(rootPath, '/**/*.sql'));

  const connection = await getConnection(ojotasConfig.dialect);

  const readFiles = files.map((file) => {
    const sql = fs.readFileSync(file, 'utf8').replace(/\n/g, '');
    const basename = path.basename(file, '.sql');
    const ast = astify(ojotasConfig.dialect, sql);
    return { file, basename, ast };
  });

  const visitedTables = [
    ...new Set(
      readFiles
        .flatMap(({ ast }) =>
          ast.type === 'select'
            ? ast.from
            : ast.type === 'insert'
            ? ast.table
            : [],
        )
        .map((f) => f.table),
    ),
  ];

  const tablesDefinition = await getTablesDefinition(connection, visitedTables);

  for (const { file, basename, ast } of readFiles) {
    const generatedSqlFile = generateSqlFnFromAst(
      nodeModulePath,
      ojotasConfig,
      basename,
      ast,
    );
    const paramsType = generateParamsTypeFromAst(
      connection.mapColumnDefinitionToType,
      tablesDefinition,
      basename,
      ast,
    );
    const returnType = generateReturnTypeFromAst(
      connection.mapColumnDefinitionToType,
      tablesDefinition,
      ojotasConfig.relations,
      basename,
      ast,
    );
    const outputPath = path.join(path.dirname(file), basename + '.sql.ts');
    fs.writeFileSync(
      outputPath,
      generatedSqlFile
        .replace('$paramsTypePlaceholder$', paramsType)
        .replace('$returnTypePlaceholder$', returnType),
    );
  }

  connection.destroy();
};
