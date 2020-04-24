/* Copyright 2019 Esri
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

/* TODO:
 * These conversions should take into account the esriFieldTypes. E.g., only esriFieldTypeString
 * can convert to an 'object' and vice-versa.
 *
 * Futhermore, these conversions should correctly handle mixed types, e.g.,
 * type = ['string', 'object'].
 */

// parse JSON objects and booleans
export const parseNonEsriTypesRead = (attributes, schema) => {
  if (!schema) return attributes;

  const newAttributes = {};

  Object.keys(schema.properties).forEach((key) => {
    try {
      if (attributes[key] === undefined) return;

      const type = schema.properties[key].type;
      if (
        type === 'object' ||
        type === 'array' ||
        type.includes('object') ||
        type.includes('array')
      ) {
        newAttributes[key] = JSON.parse(attributes[key]);
      } else if (type === 'boolean') {
        newAttributes[key] = attributes[key] === 1;
      } else {
        newAttributes[key] = attributes[key];
      }
    } catch (e) {
      newAttributes[key] = null;
    }
  });

  return newAttributes;
};

// stringify JSON objects and cast booleans to integers
export const parseNonEsriTypesWrite = (attributes, schema) => {
  if (!schema) return attributes;

  const newAttributes = {};

  Object.keys(schema.properties).forEach((key) => {
    try {
      const type = schema.properties[key].type;

      if (attributes[key] === undefined) {
        return;
      }

      if (attributes[key] === null) {
        newAttributes[key] = null;
      } else if (!type) {
        newAttributes[key] = attributes[key];
      } else if (
        type === 'object' ||
        type === 'array' ||
        type.includes('object') ||
        type.includes('array')
      ) {
        newAttributes[key] = JSON.stringify(attributes[key]);
      } else if (type === 'boolean') {
        newAttributes[key] = attributes[key] ? 1 : 0;
      } else {
        newAttributes[key] = attributes[key];
      }
    } catch (e) {
      newAttributes[key] = null;
    }
  });

  return newAttributes;
};
