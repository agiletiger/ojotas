// @ts-nocheck
import { Connection, AssembleFn, OjotasConfig, toUnnamed } from 'ojotas';

$paramsTypePlaceholder$

$returnTypePlaceholder$

export const $queryName$ = (params: $paramsTypeName$) => {
  const [unnamedSql, unnamedParams] = toUnnamed('$sql$', params);
  return async (connection: Connection, assemble: AssembleFn, ojotasConfig: OjotasConfig) => {
    try {
      const [rows] = await connection.execute(unnamedSql, unnamedParams);

      return assemble(ojotasConfig.relations, ojotasConfig.aliases, $identifiers$, rows as Record<string, unknown>[]) as $returnTypeName$[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error executing query: ${unnamedSql} with params ${unnamedParams}`, error);
      throw error;
    }
  }
};
