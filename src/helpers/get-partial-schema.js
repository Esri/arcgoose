export const getPartialSchema = (schema, fields) => {
  const newSchema = {
    ...schema,
    required: schema.required ?
      schema.required.filter(requiredField => fields.includes(requiredField)) : [],
    properties: {},
  };

  fields.forEach(outField => newSchema.properties[outField] = schema.properties[outField]);

  return newSchema;
};

export default getPartialSchema;
