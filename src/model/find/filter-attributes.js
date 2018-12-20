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

  // parse booleans
  Object.keys(newAttributes)
    .filter(key =>
      (schema[key] && (schema[key].type === Boolean || schema[key].type === 'boolean')),
    )
    .forEach((key) => {
      if (newAttributes[key] === null) {
        newAttributes[key] = schema[key].defaultValue || false;
      } else if (newAttributes[key] === 1) {
        newAttributes[key] = true;
      } else {
        newAttributes[key] = false;
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
