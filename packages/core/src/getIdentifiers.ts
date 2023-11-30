import { ReturnColumns } from './getReturnColumns';
import { invertObject } from './utils/invertObject';

export const getIdentifiers = (
  aliases: Record<string, string>,
  returnColumns: ReturnColumns,
) => {
  if (Object.keys(returnColumns).length > 1) {
    const tablesToAliases = invertObject(aliases);
    // MVP: for now when selecting from multiple tables we will take the fists column of each as its identifier
    // so we can do the assemble
    return Object.entries(returnColumns).map(
      ([table, columns]) => `${tablesToAliases[table]}.${columns[0].name}`,
    );
  }

  return [];
};
