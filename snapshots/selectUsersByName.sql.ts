
export type SelectUsersByNameQueryParams = { name: string; }; 

export interface ISelectUsersByNameQueryResultItem { id: number; name: string; }

export const selectUsersByName = (params: SelectUsersByNameQueryParams) => {
  return () => {
    return {
      sql: 'SELECT `id`, `name` FROM `users` WHERE `name` LIKE :name',
      params: params,
      identifiers: [],
      cast: (rows: unknown) => {
        return rows as ISelectUsersByNameQueryResultItem[];
      } 
    }
  }
};
