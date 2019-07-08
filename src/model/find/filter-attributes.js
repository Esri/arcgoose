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

import { parseNonEsriTypesRead } from '../../helpers/parse-non-esri-types';
import { parseAliasesRead } from '../../helpers/parse-aliases';
import { parseDefaultValuesRead } from '../../helpers/parse-default-values';
import { parseDatesRead } from '../../helpers/parse-dates';
import { validate } from '../../helpers/validate';


export const filterAttributes = (attributes, schema) => {
  if (!schema) return attributes;

  const cleanAttributes = parseNonEsriTypesRead(attributes, schema);

  const {
    valid,
    errors,
  } = validate(cleanAttributes, schema);

  if (!valid) {
    throw new Error({ errors });
  }

  return parseAliasesRead(
    parseDefaultValuesRead(
      parseDatesRead(cleanAttributes, schema),
      schema,
    ),
    schema,
  );
};


export default filterAttributes;
