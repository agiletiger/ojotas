import * as mysql from 'mysql2/promise';
import { ColumnDefinition } from './mapColumnDefinitionToType';

export interface TableDefinition {
  [columnName: string]: ColumnDefinition;
}

export interface MultiTableDefinition {
  [tableName: string]: TableDefinition;
}

const getEnumNameFromColumn = (dataType: string, columnName: string): string =>
  `${dataType}_${columnName}`;

export const getTableDefinition = async (
  connection: mysql.Connection,
  tableSchema: string,
  tableName: string,
) => {
  const tableDefinition: TableDefinition = {};

  const [tableColumns] = await connection.query<mysql.RowDataPacket[]>(
    'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = ? and table_schema = ?',
    [tableName, tableSchema],
  );
  tableColumns.map((schemaItem) => {
    const columnName = schemaItem.COLUMN_NAME;
    const dataType = schemaItem.DATA_TYPE;
    tableDefinition[columnName] = {
      udtName: /^(enum|set)$/i.test(dataType)
        ? getEnumNameFromColumn(dataType, columnName)
        : dataType,
      nullable: schemaItem.IS_NULLABLE === 'YES',
    };
  });
  return tableDefinition;
};

export const getMultiTableDefinition = async (
  connection: mysql.Connection,
  tableSchema: string,
  tableNames: string[],
): Promise<MultiTableDefinition> => {
  const multiTableDefinition: MultiTableDefinition = {};
  const placeholders = tableNames.map(() => '?').join(',');
  const query = `
    SELECT 
      table_name, column_name, data_type, is_nullable 
    FROM 
      information_schema.columns 
    WHERE 
      table_name IN (${placeholders}) AND
      table_schema = ?
  `;
  const [results] = await connection.query<mysql.RowDataPacket[]>(query, [
    ...tableNames,
    tableSchema,
  ]);
  results.forEach((row) => {
    const tableName = row.TABLE_NAME as string;
    const columnName = row.COLUMN_NAME as string;
    const dataType = row.DATA_TYPE as string;
    const isNullable = row.IS_NULLABLE as string;

    if (!multiTableDefinition[tableName]) {
      multiTableDefinition[tableName] = {};
    }

    multiTableDefinition[tableName][columnName] = {
      udtName: /^(enum|set)$/i.test(dataType)
        ? getEnumNameFromColumn(dataType, columnName)
        : dataType,
      nullable: isNullable === 'YES',
    };
  });

  return multiTableDefinition;
};
