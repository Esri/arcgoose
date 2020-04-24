/* Copyright 2020 Esri
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

import { ajv } from '../../helpers/validate';
import { filterAttributes } from './filter-attributes';

const toArray = (input) => (Array.isArray(input) ? input : [input]);

// takes array of features
export const parseUpdate = (input, schema) => {
  let validator = null;

  if (schema) {
    const { required, ...partialSchema } = schema;
    validator = ajv.compile(partialSchema);
  }

  return toArray(input).map((object) => {
    const { geometry, attributes } = object;
    return {
      attributes: filterAttributes(attributes, schema, validator),
      geometry: (geometry && geometry.toJSON && geometry.toJSON()) || geometry,
    };
  });
};

export default parseUpdate;
