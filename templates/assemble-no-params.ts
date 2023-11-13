// @ts-nocheck
import { Connection, AssembleFn, OjotasConfig } from 'ojotas';

$returnTypePlaceholder$

export const $queryName$ = async (connection: Connection, assemble: AssembleFn, ojotasConfig: OjotasConfig) => {
  const sql = '$sql$';
  try {
    const [rows] = await connection.execute(sql);

    return assemble(ojotasConfig.relations, ojotasConfig.aliases, $identifiers$, rows as Record<string, unknown>[],) as $returnTypeName$[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error executing query: ${sql}`, error);
    throw error;
  }
};
