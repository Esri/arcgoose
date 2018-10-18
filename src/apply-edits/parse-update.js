import { filterAttributes } from './filter-attributes';

const toArray = input => (Array.isArray(input) ? input : [input]);

// takes array of features
export const parseUpdate = (input, schema) => toArray(input)
  .map((object) => {
    const { geometry, attributes } = object;
    return {
      attributes: filterAttributes(attributes, schema),
      geometry: (geometry && geometry.toJSON && geometry.toJSON()) || geometry,
    };
  });

export default parseUpdate;
