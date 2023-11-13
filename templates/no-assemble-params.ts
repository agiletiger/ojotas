// @ts-nocheck
import { Connection, toUnnamed } from 'ojotas';

$paramsTypePlaceholder$

$returnTypePlaceholder$

export const $queryName$ = (params: $paramsTypeName$) => {
  const [unnamedSql, unnamedParams] = toUnnamed('$sql$', params);
  return async (connection: Connection) => {
    try {
      const [rows] = await connection.execute(unnamedSql, unnamedParams);

      return rows as $returnTypeName$[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error executing query: ${unnamedSql} with params ${unnamedParams}`, error);
      throw error;
    }
  }
};
