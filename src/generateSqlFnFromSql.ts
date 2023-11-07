import { getSelectedColumns } from './getSelectedColumns';
import { Relations } from './assemble';
import { getResultTypeName } from './getResultTypeName';
import { aliasify } from './aliasify';

const invertObject = (
  object: Record<string, string>,
): Record<string, string> => {
  const invertedObject: Record<string, string> = {};
  for (const key in object) {
    // eslint-disable-next-line no-prototype-builtins
    if (object.hasOwnProperty(key)) {
      invertedObject[object[key]] = key;
    }
  }
  return invertedObject;
};

const getSqlFnTemplate = (
  sql: string,
  innerCode: string,
  queryName: string,
  assemble: boolean,
) => `
  import { Connection${
    assemble ? ', AssembleFn, OjotasConfig' : ''
  } } from 'ojotas';

  $$TYPES_PLACEHOLDER$$

  export const ${queryName} = async (connection: Connection${
    assemble ? ', assemble: AssembleFn, ojotasConfig: OjotasConfig' : ''
  }) => {
    const sql = "${sql}";
    try {
      const [rows] = await connection.execute(sql);
      
      return ${innerCode} as ${getResultTypeName(queryName)}[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(\`Error executing query: \${sql}\`, error);
      throw error;
    }
  }
`;

export const generateSqlFnFromSql = (
  ojotasConfig: { aliases: Record<string, string>; relations: Relations },
  queryName: string,
  sql: string,
) => {
  const selectedColumns = getSelectedColumns(sql);
  if (Object.keys(selectedColumns).length > 1) {
    const tablesToAliases = invertObject(ojotasConfig.aliases);
    // MVP: for now when selecting from multiple tables we will take the fists column of each as its identifier
    // so we can do the assemble
    const identifiers = Object.entries(selectedColumns).map(
      ([table, columns]) => `${tablesToAliases[table]}.${columns[0]}`,
    );

    return getSqlFnTemplate(
      aliasify(sql),
      `assemble(ojotasConfig.relations, ojotasConfig.aliases, ${JSON.stringify(
        identifiers,
      )}, rows as Record<string, unknown>[],)`,
      queryName,
      true,
    );
  } else {
    return getSqlFnTemplate(sql, `rows`, queryName, false);
  }
};
