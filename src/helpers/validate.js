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

import * as Ajv from 'ajv';

// parse JSON objects and booleans
export const validate = (attributes, schema) => {
  if (!schema) {
    return {
      valid: true,
      errors: null,
    };
  }

  const ajv = new Ajv({
    $data: true,
  });

  const validator = ajv.compile(schema);

  const valid = validator(attributes);

  return {
    valid,
    errors: validator.errors,
  };
};


export default validate;
