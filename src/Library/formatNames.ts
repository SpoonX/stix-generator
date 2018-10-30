export const formatNames = (name: string): { camelCased: string, pascalCased: string, upperCased: string } => {
  const normalized = (name[0].toLowerCase() + name.substr(1)).replace(' ', '-');
  const camelCased = normalized.replace(/-([a-z])/ig, (x, character) => character.toUpperCase());
  const pascalCased = camelCased[0].toUpperCase() + camelCased.substr(1);
  const upperCased = camelCased.replace(/([A-Z])/g, c => `_${c}`).toUpperCase();

  return { camelCased, pascalCased, upperCased };
};

export type NameFormatsType = { camelCased: string; pascalCased: string; upperCased: string; };
