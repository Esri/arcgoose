const toArray = input => (Array.isArray(input) ? input : [input]);

// takes array of GlobalIDs
export const parseDelete = (input, paddingCharacter) => {
  const items = toArray(input);
  const padding = paddingCharacter || '';

  if (items[0] && items[0].attributes) {
    return items.map(item => `${padding}${item.attributes.GlobalID}${padding}`);
  }

  return items.map(item => `${padding}${item}${padding}`);
};

export default parseDelete;
