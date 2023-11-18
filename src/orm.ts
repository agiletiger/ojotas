import * as fs from 'node:fs';
import * as mysql from 'mysql2/promise';

import { assemble } from './assemble';
import createCompiler from 'named-placeholders';

type Query = <T>(
  connection: Connection,
  descriptor: Descriptor<T>,
) => Promise<T[]>;

export type ConnectionOptions = mysql.ConnectionOptions;

export type Connection = {
  query: (
    sql: string,
    values: unknown,
  ) => Promise<[Record<string, unknown>[], unknown]>;
  execute: (sql: string) => Promise<[Record<string, unknown>[], unknown]>;
  changeUser: (options: ConnectionOptions) => Promise<void>;
  destroy(): void;
};

export type Descriptor<T> = () => {
  sql: string;
  params: Record<string, unknown> | null;
  identifiers: string[];
  cast: (rows: unknown) => T[];
};

const toUnnamed = createCompiler();

const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

export const createMySqlConnection = async (
  options: ConnectionOptions,
): Promise<Connection> => {
  const connection = await mysql.createConnection(options);
  return connection;
};

export const query: Query = async (connection, descriptor) => {
  const { sql, params, identifiers, cast } = descriptor();
  const [unnamedSql, unnamedParams] = toUnnamed(sql, params);
  try {
    const [rows] = await connection.query(unnamedSql, unnamedParams);

    return cast(
      identifiers.length
        ? assemble(
            ojotasConfig.relations,
            ojotasConfig.aliases,
            identifiers,
            rows as Record<string, unknown>[],
          )
        : rows,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Error executing query: ${unnamedSql} with params ${unnamedParams}`,
      error,
    );
    throw error;
  }
};
