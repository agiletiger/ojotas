const groupAliases = (object) => {
  const result = {};

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in object) {
    const group = key.includes('.') ? key.split('.')[0] : '';
    result[group] ??= {};
    result[group][key] = object[key];
  }

  return Object.values(result);
};

export default groupAliases;
