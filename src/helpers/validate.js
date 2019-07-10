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

import Ajv from 'ajv';

const ajv = new Ajv({
  $data: true,
});

class ValidationError extends Error {
  constructor(errors = [], data = null, schema = null, ...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }

    console.log(errors);
    console.log(data);
    console.log(schema);

    this.name = 'ValidationError';
    this.errors = errors;
    this.data = data;
    this.schema = schema;
  }
}


// parse JSON objects and booleans
export const validate = (attributes, schema) => {
  if (!schema) {
    return {
      valid: true,
      errors: null,
    };
  }

  const validator = ajv.compile(schema);

  const valid = validator(attributes);

  return valid ? null : new ValidationError(validator.errors, attributes, schema);
};


export default validate;
