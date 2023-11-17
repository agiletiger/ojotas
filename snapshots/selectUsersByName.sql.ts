// @ts-nocheck
$paramsTypePlaceholder$

$returnTypePlaceholder$

export const selectUsersByName = (params: ISelectUsersByNameQueryParams) => {
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
