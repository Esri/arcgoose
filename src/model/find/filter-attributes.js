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
  if (!schema) return attributes;

  const newAttributes = { ...attributes };

  // parse JSON objects
  Object.keys(newAttributes)
    .filter(key => schema[key])
    .forEach((key) => {
      // null values should be replaced by defaultValue if present
      if (newAttributes[key] === null) {
        newAttributes[key] = schema[key].defaultValue || null;
        return;
      }

      // some special types need casting
      try {
        switch (schema[key].type) {
          case Object:
          case 'object': {
            newAttributes[key] = JSON.parse(newAttributes[key]);
            break;
          }

          case Date:
          case 'date': {
            newAttributes[key] = new Date(newAttributes[key]);
            break;
          }

          case Boolean:
          case 'boolean': {
            newAttributes[key] = newAttributes[key] === 1;
            break;
          }

          default: {
            break;
          }
        }
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
