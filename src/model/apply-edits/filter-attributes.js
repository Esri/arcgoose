/* Copyright 2021 Esri
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

import Ajv from 'ajv';
import { parseNonEsriTypesWrite } from '../../helpers/parse-non-esri-types';
import { validateWithValidator } from '../../helpers/validate';

// Legacy
export const validateAttributes = (attributes, schema, partialUpdate) => {
  if (!schema) return attributes;

  const ajv = new Ajv({
    $data: true,
    allErrors: true,
  });

  const { required, ...partialSchema } = schema;
  const validationSchema = partialUpdate ? partialSchema : schema;
  const validator = ajv.compile(validationSchema);

  return validateWithValidator(attributes, validator, validationSchema);
};

export const filterAttributes = (attributes, schema, validator) => {
  if (!validator) return attributes;

  const validationError = validateWithValidator(attributes, validator, schema);

  if (validationError) {
    throw validationError;
  }

  return parseNonEsriTypesWrite(attributes, schema);
};

export default filterAttributes;
