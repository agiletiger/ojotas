import { capitalize } from './utils/capitalize';

export const getParamsTypeName = (queryName: string) =>
  `${capitalize(queryName)}QueryParams`;
