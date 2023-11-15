import 'dotenv/config';

import { globSync } from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';

import { generateSqlFnFromAst } from './generateSqlFnFromAst';
import { generateReturnTypeFromAst } from './generateReturnTypeFromAst';
import { astify } from './parser';
import { generateParamsTypeFromAst } from './generateParamsTypeFromAst';
import { getTablesDefinition } from './getTablesDefinition';

export const codegen = async (nodeModulePath: string, rootPath: string) => {
  const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

  const files = globSync(path.join(rootPath, '/**/*.sql'));

  const database = process.env.DB_NAME;

  const connectionOptions: mysql.ConnectionOptions = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
  const connection = await mysql.createConnection(connectionOptions);

  const readFiles = files.map((file) => {
    const sql = fs.readFileSync(file, 'utf8').replace(/\n/g, '');
    const basename = path.basename(file, '.sql');
    const ast = astify(sql);
    return { file, basename, ast };
  });

  const visitedTables = [
    ...new Set(
      readFiles
        .flatMap(({ ast }) => (ast.type === 'select' ? ast.from : []))
        .map((f) => f.table),
    ),
  ];

  const tableDefinitions = await getTablesDefinition(
    connection,
    database,
    visitedTables,
  );

  for await (const { file, basename, ast } of readFiles) {
    const generatedSqlFile = generateSqlFnFromAst(
      nodeModulePath,
      ojotasConfig,
      basename,
      ast,
    );
    const paramsType = generateParamsTypeFromAst(
      tableDefinitions,
      basename,
      ast,
    );
    const returnType = generateReturnTypeFromAst(
      tableDefinitions,
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
