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
  const castJsonAttributes = {};
  Object.keys(schema)
    .filter(key => schema[key].type === Object || schema[key].type === 'object')
    .forEach((key) => {
      try {
        castJsonAttributes[key] = JSON.stringify(attributes[key]);
      } catch (e) {
        castJsonAttributes[key] = null;
      }
    });

  const castDateAttributes = {};
  Object.keys(schema)
    .filter(key => schema[key].type === Date || schema[key].type === 'date')
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
