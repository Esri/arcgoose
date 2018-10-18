

// takes array of features
export const castAttributes = (attributes, schema) => {
  const castJsonAttributes = {};
  Object.keys(schema)
    .filter(key => schema[key].type === 'object')
    .forEach((key) => {
      try {
        castJsonAttributes[key] = JSON.stringify(attributes[key]);
      } catch (e) {
        castJsonAttributes[key] = null;
      }
    });

  const castDateAttributes = {};
  Object.keys(schema)
    .filter(key => schema[key].type === 'date')
    .forEach((key) => {
      try {
        castDateAttributes[key] = attributes[key].getTime();
      } catch (e) {
        castDateAttributes[key] = null;
      }
    });

  return {
    ...attributes,
    ...castJsonAttributes,
    ...castDateAttributes,
  };
};


export const dealiasAttributes = (attributes, schema) => {
  if (!schema) return attributes;

  const mapping = {};
  Object.keys(schema)
    .forEach(key => mapping[schema[key].alias || key] = key);

  const newAttributes = {};
  Object.keys(attributes)
    .forEach(key => newAttributes[mapping[key]] = attributes[key]);

  return newAttributes;
};


export const filterAttributes = (attributes, schema) => {
  const dealiasedAttributes = dealiasAttributes(attributes, schema);
  const castedAttributes = castAttributes(dealiasedAttributes, schema);

  return castedAttributes;
};

export default filterAttributes;
