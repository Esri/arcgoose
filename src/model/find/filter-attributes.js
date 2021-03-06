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

import { parseNonEsriTypesRead } from '../../helpers/parse-non-esri-types';
import { validateWithValidator } from '../../helpers/validate';

export const filterAttributes = (
  attributes,
  schema,
  validator,
  esriObjectIdField,
) => {
  if (!schema) return attributes;

  const cleanAttributes = parseNonEsriTypesRead(attributes, schema);
  const esriObjectId = attributes[esriObjectIdField];

  let validationError;

  if (validator) {
    validationError = validateWithValidator(cleanAttributes, validator, schema);
  }

  return {
    attributes: {
      ...cleanAttributes,
      esriObjectId,
    },
    ...(validator ? { validation: validationError } : null),
  };
};

export default filterAttributes;
