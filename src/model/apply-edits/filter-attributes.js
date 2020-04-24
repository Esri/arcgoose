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

import { parseNonEsriTypesWrite } from '../../helpers/parse-non-esri-types';
import { parseAliasesWrite } from '../../helpers/parse-aliases';
import { validate } from '../../helpers/validate';
import { getPartialSchema } from '../../helpers/get-partial-schema';

export const validateAttributes = (attributes, schema, partialUpdate) => {
  if (!schema) return attributes;

  const cleanAttributes = parseAliasesWrite(attributes, schema);

  const validationSchema = partialUpdate
    ? getPartialSchema(schema, Object.keys(cleanAttributes))
    : schema;

  return validate(cleanAttributes, validationSchema);
};

export const filterAttributes = (attributes, schema, partialUpdate) => {
  if (!schema) return attributes;

  const cleanAttributes = parseAliasesWrite(attributes, schema);

  const validationSchema = partialUpdate
    ? getPartialSchema(schema, Object.keys(cleanAttributes))
    : schema;

  const validationError = validate(cleanAttributes, validationSchema);

  if (validationError) {
    throw validationError;
  }

  return parseNonEsriTypesWrite(cleanAttributes, schema);
};

export default filterAttributes;
