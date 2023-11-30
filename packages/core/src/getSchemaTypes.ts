import { Connection } from './orm';

type TableName = string;
type ColumnName = string;
type SqlType = string;

export type SchemaTypes = Record<
  TableName,
  Record<
    ColumnName,
    {
      type: SqlType;
      nullable: boolean;
    }
  >
>;

const getEnumNameFromColumn = (dataType: string, columnName: string): string =>
  `${dataType}_${columnName}`;

export const getSchemaTypes = async (
  connection: Connection,
  tableNames: string[],
): Promise<SchemaTypes> => {
  const schemaTypes: SchemaTypes = {};

  const columnsInfoSql = await connection.query(connection.columnsInfoSql, {
    tableNames: [tableNames],
  });

  columnsInfoSql.forEach((row) => {
    const tableName = row.table as string;
    const columnName = row.column as string;
    const dataType = row.type as string;
    const isNullable = row.nullable as string;

    if (!schemaTypes[tableName]) {
      schemaTypes[tableName] = {};
    }

    schemaTypes[tableName][columnName] = {
      type: /^(enum|set)$/i.test(dataType)
        ? getEnumNameFromColumn(dataType, columnName)
        : dataType,
      nullable: isNullable === 'YES',
    };
  });

  return schemaTypes;
};
