import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { Client, ClientConfig } from 'pg';

import { assemble } from './assemble';
import createCompiler, { toNumbered } from 'named-placeholders';
import {
  MapSqlTypeToTsTypeFn,
  mapMySqlTypeToTsType,
  mapPostgreSqlTypeToTsType,
} from './mapSqlTypeToTsType';

type Query = <T>(
  connection: Connection,
  descriptor: Descriptor<T>,
) => Promise<T[]>;

export type MySqlConnectionConfig = mysql.ConnectionOptions;
export type PostgreSqlConnectionConfig = string | ClientConfig;
export type Dialect = 'mysql' | 'postgres';

export type Connection = {
  query: (
    sql: string,
    values?: Record<string, unknown>,
  ) => Promise<Record<string, unknown>[]>;
  destroy(): Promise<void>;
  mapMySqlTypeToTsType: MapSqlTypeToTsTypeFn;
  columnsInfoSql: string;
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
  config: MySqlConnectionConfig,
): Promise<Connection> => {
  const connection = await mysql.createConnection(config);
  return {
    query: async (sql, params) => {
      const [unnamedSql, unnamedParams] = toUnnamed(sql, params);
      const res = await connection.query(unnamedSql, unnamedParams);
      return res[0] as Record<string, unknown>[];
    },
    destroy: async () => connection.destroy(),
    mapMySqlTypeToTsType: mapMySqlTypeToTsType,
    columnsInfoSql: `SELECT 
      table_name AS 'table', column_name AS 'column', data_type AS 'type', is_nullable AS 'nullable'
    FROM 
      information_schema.columns 
    WHERE 
      table_name IN :tableNames AND table_schema != 'performance_schema'`,
  };
};

export const createPostgreSqlConnection = async (
  config: PostgreSqlConnectionConfig,
): Promise<Connection> => {
  const client = new Client(config);

  await client.connect();

  return {
    query: async (sql, params) => {
      const [numberedSql, numberedParams] = toNumbered(sql, params);
      const res = await client.query(numberedSql, numberedParams);
      return res.rows as unknown as Record<string, unknown>[];
    },
    destroy: async () => client.end(),
    mapMySqlTypeToTsType: mapPostgreSqlTypeToTsType,
    columnsInfoSql: `SELECT 
      table_name AS "table", column_name AS "column", udt_name AS "type", is_nullable AS "nullable"
    FROM 
      information_schema.columns 
    WHERE 
      table_name = ANY(:tableNames)`,
  };
};

export const query: Query = async (connection, descriptor) => {
  const { sql, params, identifiers, cast } = descriptor();
  try {
    const rows = await connection.query(sql, params);

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
    console.error(`Error executing query: ${sql} with params ${params}`, error);
    throw error;
  }
};
