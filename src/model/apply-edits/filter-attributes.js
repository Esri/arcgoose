/* Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// takes array of features
export const castAttributes = (attributes, schema) => {
  const castedAttributes = {};

  Object.keys(schema)
    // .filter(key => schema[key].type === Object || schema[key].type === 'object')
    .filter(key => attributes[key] !== undefined)
    .forEach((key) => {
      // some special types need casting
      try {
        switch (schema[key].type) {
          case Object:
          case 'object': {
            castedAttributes[key] = JSON.stringify(attributes[key]);
            break;
          }

          case Date:
          case 'date': {
            castedAttributes[key] = attributes[key].getTime();
            break;
          }

          case Boolean:
          case 'boolean': {
            castedAttributes[key] = attributes[key] ? 1 : 0;
            break;
          }

          default: {
            break;
          }
        }
      } catch (e) {
        castedAttributes[key] = null;
      }
    });

  return {
    ...attributes,
    ...castedAttributes,
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
