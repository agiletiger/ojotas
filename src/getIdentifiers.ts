import { invertObject } from './utils/invertObject';

export const getIdentifiers = (
  aliases: Record<string, string>,
  selectedColumns: Record<string, string[]>,
) => {
  if (Object.keys(selectedColumns).length > 1) {
    const tablesToAliases = invertObject(aliases);
    // MVP: for now when selecting from multiple tables we will take the fists column of each as its identifier
    // so we can do the assemble
    return Object.entries(selectedColumns).map(
      ([table, columns]) => `${tablesToAliases[table]}.${columns[0]}`,
    );
  }

  return [];
};
