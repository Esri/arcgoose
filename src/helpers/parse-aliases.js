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
export const parseAliasesRead = (attributes, schema) => {
  if (!schema) return attributes;

  const newAttributes = {};

  Object.keys(schema.properties)
    .filter((key) => attributes[key] !== undefined)
    .forEach((key) => {
      if (schema.properties[key].alias) {
        newAttributes[schema.properties[key].alias] = attributes[key];
      } else {
        newAttributes[key] = attributes[key];
      }
    });

  return newAttributes;
};

// stringify JSON objects and cast booleans to integers
export const parseAliasesWrite = (attributes, schema) => {
  if (!schema) return attributes;

  const newAttributes = {};

  Object.keys(schema.properties).forEach((key) => {
    if (
      schema.properties[key].alias &&
      attributes[schema.properties[key].alias] !== undefined
    ) {
      newAttributes[key] = attributes[schema.properties[key].alias];
    } else if (attributes[key] !== undefined) {
      newAttributes[key] = attributes[key];
    }
  });

  return newAttributes;
};
