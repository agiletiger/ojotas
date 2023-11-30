
export interface ISelectAllUsersQueryResultItem { id: number; name: string; }

export const selectAllUsers = () => {
  return {
    sql: 'SELECT `id`, `name` FROM `users`',
    params: null,
    identifiers: [],
    cast: (rows: unknown) => {
      return rows as ISelectAllUsersQueryResultItem[];
    } 
  }
};
