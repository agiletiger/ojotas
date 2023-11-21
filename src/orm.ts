import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { Client, ClientConfig } from 'pg';

import { assemble } from './assemble';
import createCompiler from 'named-placeholders';

type Query = <T>(
  connection: Connection,
  descriptor: Descriptor<T>,
) => Promise<T[]>;

export type ConnectionOptions = mysql.ConnectionOptions;

export type Connection = {
  query: (sql: string, values?: unknown) => Promise<Record<string, unknown>[]>;
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
  return {
    query: async (sql, values) => {
      const res = await connection.query(sql, values);
      return res[0] as Record<string, unknown>[];
    },
    destroy: () => connection.destroy(),
  };
};

export const createPostgreSqlConnection = async (
  config?: string | ClientConfig,
): Promise<Connection> => {
  const client = new Client(config);

  await client.connect();

  return {
    query: async (sql, values) => {
      const res = await client.query(sql, values as unknown[]);
      return res.rows as unknown as Record<string, unknown>[];
    },
    destroy: () => client.end(),
  };
};

export const query: Query = async (connection, descriptor) => {
  const { sql, params, identifiers, cast } = descriptor();
  const [unnamedSql, unnamedParams] = toUnnamed(sql, params);
  try {
    const rows = await connection.query(unnamedSql, unnamedParams);

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
