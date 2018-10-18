

// takes array of features
export const castAttributes = (attributes, schema) => {
  if (!schema) return attributes;

  const newAttributes = { ...attributes };

  // parse JSON objects
  Object.keys(newAttributes)
    .filter(key =>
      (schema[key] && (schema[key].type === Object || schema[key].type === 'object')),
    )
    .forEach((key) => {
      if (newAttributes[key] === null) {
        newAttributes[key] = schema[key].defaultValue || null;
        return;
      }

      try {
        newAttributes[key] = JSON.parse(newAttributes[key]);
      } catch (e) {
        newAttributes[key] = schema[key].defaultValue || null;
      }
    });

  // parse dates
  Object.keys(newAttributes)
    .filter(key =>
      (schema[key] && (schema[key].type === Date || schema[key].type === 'date')),
    )
    .forEach((key) => {
      if (newAttributes[key] === null) {
        newAttributes[key] = schema[key].defaultValue || null;
        return;
      }

      try {
        newAttributes[key] = new Date(newAttributes[key]);
      } catch (e) {
        newAttributes[key] = schema[key].defaultValue || null;
      }
    });

  return newAttributes;
};


export const aliasAttributes = (attributes, schema) => {
  if (!schema) return attributes;

  const mapping = {};
  Object.keys(schema)
    .forEach(key => mapping[key] = schema[key].alias || key);

  const newAttributes = {};
  Object.keys(attributes)
    .forEach(key => newAttributes[mapping[key]] = attributes[key]);

  return newAttributes;
};


export const filterAttributes = (attributes, schema) =>
  aliasAttributes(castAttributes(attributes, schema), schema);


export default filterAttributes;
