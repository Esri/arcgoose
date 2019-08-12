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
  allErrors: true,
});


const applyAliasesToPath = (dataPath, schemaPath, schema) => {
  const schemaPathComponents = schemaPath.split('/');
  const field = schemaPathComponents[2];

  const alias = schema.properties[field] && schema.properties[field].alias;


  if (alias) {
    schemaPathComponents.splice(2, 1, alias);
    return {
      dataPath: `.${alias}${dataPath.slice(field.length + 1)}`,
      schemaPath: schemaPathComponents.join('/'),
    };
  }

  return {
    dataPath,
    schemaPath,
  };
};


class ValidationError extends Error {
  constructor(errors = [], data = null, schema = null, ...params) {
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }

    console.warn({ errors, data, schema }); // eslint-disable-line

    this.name = 'ValidationError';
    this.errors = errors.map(({ dataPath, schemaPath, ...remainder }) => ({
      ...remainder,
      ...applyAliasesToPath(dataPath, schemaPath, schema),
    }));
    this.data = data;
    this.schema = schema;
  }
}


export const getValidator = schema => ajv.compile(schema);


// parse JSON objects and booleans
export const validate = (attributes, schema) => {
  if (!schema) return null;

  const validator = getValidator(schema);

  const valid = validator(attributes);

  return valid ? null : new ValidationError(validator.errors, attributes, schema);
};


export default validate;
