// @ts-nocheck
import { Connection, toUnnamed } from 'ojotas';

$paramsTypePlaceholder$

$returnTypePlaceholder$

export const selectUsersByName = (params: ISelectUsersByNameQueryParams) => {
  const [unnamedSql, unnamedParams] = toUnnamed('SELECT `id`, `name` FROM `users` WHERE `name` LIKE :name', params);
  return async (connection: Connection) => {
    try {
      const [rows] = await connection.execute(unnamedSql, unnamedParams);

      return rows as ISelectUsersByNameQueryResultItem[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error executing query: ${unnamedSql} with params ${unnamedParams}`, error);
      throw error;
    }
  }
};
