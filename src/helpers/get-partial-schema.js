export const getPartialSchema = (schema, fields) => {
  const newSchema = {
    ...schema,
    required: schema.required ?
      schema.required.filter(requiredField => fields.includes(requiredField)) : [],
    properties: {},
  };

  fields
    .filter(field => schema.properties[field])
    .forEach(field => newSchema.properties[field] = schema.properties[field]);

  return newSchema;
};

export default getPartialSchema;
