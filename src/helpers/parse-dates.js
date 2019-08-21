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


// parse JSON objects and booleans
export const parseDatesRead = (attributes, schema) => {
  if (!schema) return attributes;

  const newAttributes = {};

  Object.keys(schema.properties)
    .filter(key => attributes[key] !== undefined)
    .forEach(key => {
      try {
        if (schema.properties[key].date) {
          newAttributes[key] = new Date(attributes[key]);
        } else {
          newAttributes[key] = attributes[key];
        }
      } catch (e) {
        newAttributes[key] = attributes[key];
      }
    });

  return newAttributes;
};


// stringify JSON objects and cast booleans to integers
export const parseDatesWrite = (attributes, schema) => {
  if (!schema) return attributes;

  const newAttributes = {};

  Object.keys(schema.properties)
    .filter(key => attributes[key] !== undefined)
    .forEach(key => {
      try {
        if (schema.properties[key].date) {
          newAttributes[key] = attributes[key].getTime();
        } else {
          newAttributes[key] = attributes[key];
        }
      } catch (e) {
        newAttributes[key] = attributes[key];
      }
    });

  return newAttributes;
};
