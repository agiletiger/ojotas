import * as fs from 'node:fs';

import { assemble } from './assemble';
import { Connection as MySqlConnection } from 'mysql2/promise';
import { default as toUnnamedBuilder } from 'named-placeholders';

type Query = <T>(
  connection: Connection,
  descriptor: Descriptor<T>,
) => Promise<T[]>;

export type Connection = MySqlConnection;

export type Descriptor<T> = () => {
  sql: string;
  params: Record<string, unknown> | null;
  identifiers: string[];
  cast: (rows: unknown) => T[];
};

const toUnnamed = toUnnamedBuilder();

const ojotasConfig = JSON.parse(fs.readFileSync('.ojotasrc.json').toString());

export const query: Query = async (connection, descriptor) => {
  const { sql, params, identifiers, cast } = descriptor();
  const [unnamedSql, unnamedParams] = toUnnamed(sql, params);
  try {
    const [rows] = await connection.execute(unnamedSql, unnamedParams);

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
