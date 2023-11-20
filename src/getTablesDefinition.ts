import { ColumnDefinition } from './mapColumnDefinitionToType';
import { Connection } from './orm';

export interface TableDefinition {
  [columnName: string]: ColumnDefinition;
}
const getEnumNameFromColumn = (dataType: string, columnName: string): string =>
  `${dataType}_${columnName}`;
export const getTablesDefinition = async (
  connection: Connection,
  tableSchema: string,
  tableNames: string[],
): Promise<Record<string, TableDefinition>> => {
  const tableDefinitions: Record<string, TableDefinition> = {};

  const query = `
    SELECT 
      table_name, column_name, data_type, is_nullable 
    FROM 
      information_schema.columns 
    WHERE 
      table_name IN ? AND
      table_schema = ?
  `;
  const results = await connection.query(query, [[tableNames], tableSchema]);
  results.forEach((row) => {
    const tableName = row.TABLE_NAME as string;
    const columnName = row.COLUMN_NAME as string;
    const dataType = row.DATA_TYPE as string;
    const isNullable = row.IS_NULLABLE as string;

    if (!tableDefinitions[tableName]) {
      tableDefinitions[tableName] = {};
    }

    tableDefinitions[tableName][columnName] = {
      udtName: /^(enum|set)$/i.test(dataType)
        ? getEnumNameFromColumn(dataType, columnName)
        : dataType,
      nullable: isNullable === 'YES',
    };
  });
  return tableDefinitions;
};
