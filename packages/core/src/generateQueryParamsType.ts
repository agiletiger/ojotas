import { QueryParam } from './getQueryParams';
import { getParamsTypeName } from './getParamsTypeName';

export const generateQueryParamsType = (
  queryName: string,
  params: QueryParam[],
) => {
  const mappedParams: string[] = [];

  for (const param of params) {
    mappedParams.push(
      `${param.name}${param.optional ? '?' : ''}: ${param.type};`,
    );
  }

  if (mappedParams.length) {
    return `
      export type ${getParamsTypeName(queryName)} = {
        ${mappedParams.join('\n')}
      };
      `;
  }

  return '';
};
