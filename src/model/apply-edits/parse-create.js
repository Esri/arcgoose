import uuid from './uuid';
import { filterAttributes } from './filter-attributes';

const toArray = input => (Array.isArray(input) ? input : [input]);

// takes array of features
export const parseCreate = (input, schema) => toArray(input)
  .map((object) => {
    const { geometry, attributes } = object;
    return {
      attributes: {
        ...filterAttributes(attributes, schema),
        GlobalID: attributes.GlobalID || uuid(),
      },
      geometry: (geometry && geometry.toJSON && geometry.toJSON()) || geometry,
    };
  });

export default parseCreate;
