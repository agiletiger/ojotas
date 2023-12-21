import { NonEmptyArray, PossiblyEmptyArray } from 'ojotas';

export type InsertUserQueryParams = {
  name: string;
};

export interface IInsertUserQueryResultItem {}

export const insertUser = (params: InsertUserQueryParams) => {
  return () => {
    return {
      sql: 'INSERT INTO `users` (`name`) VALUES (:name)',
      params: params,
      identifiers: [],
      cast: (rows: unknown) => {
        return rows as IInsertUserQueryResultItem[];
      },
    };
  };
};
