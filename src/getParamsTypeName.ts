import { capitalize } from './utils/capitalize';

export const getParamsTypeName = (queryName: string) =>
  `I${capitalize(queryName)}QueryParams`;
