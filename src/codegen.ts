#! /usr/bin/env node

import 'dotenv/config';

import { globSync } from 'fast-glob';
import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';

import { generateSqlFnFromSql } from './generateSqlFnFromSql';
import { generateTypeDefinitionFromSql } from './generateTypeDefinitionFromSql';

const codegen = async () => {
  const rootPath: string = process.argv[2];
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

  for await (const file of files) {
    const sql = fs.readFileSync(file, 'utf8').replace(/\n/g, '');
    const basename = path.basename(file, '.sql');
    const generatedSqlFile = generateSqlFnFromSql(ojotasConfig, basename, sql);
    const typeDefinition = await generateTypeDefinitionFromSql(
      ojotasConfig.relations,
      connection,
      database,
      basename,
      sql,
    );
    const outputPath = path.join(path.dirname(file), basename + '.sql.ts');
    fs.writeFileSync(
      outputPath,
      generatedSqlFile.replace('$$TYPES_PLACEHOLDER$$', typeDefinition),
    );
  }

  connection.destroy();
};

(async () => {
  await codegen();
})();
