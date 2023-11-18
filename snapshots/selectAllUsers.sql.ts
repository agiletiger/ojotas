// @ts-nocheck
$returnTypePlaceholder$

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
