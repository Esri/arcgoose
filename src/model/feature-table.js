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

import Ajv from 'ajv';
import Find from './find';
import ApplyEdits from './apply-edits';

const parseValue = (value) =>
  typeof value === 'string' ? `'${value}'` : `${value}`;

const getQueryFromQueryObject = (queryObject) =>
  Object.keys(queryObject)
    .map((key) => `${key} = ${parseValue(queryObject[key])}`)
    .join(' AND ');

export class FeatureLayer {
  constructor({ url, serviceUrl, id, name, schema, authentication }) {
    this.type = 'table';
    this.url = url;
    this.serviceUrl = serviceUrl;
    this.id = id;
    this.name = name;
    this.schema = schema;
    this.authentication = authentication;

    this.ajv = new Ajv({
      $data: true,
      allErrors: true,
    });

    const { required, $id, ...partialSchema } = schema;
    this.ajv.compile({ $id: 'schema', ...schema });
    this.ajv.compile({ $id: 'partialSchema', partialSchema });
  }

  find(queryObject) {
    const query = {
      filters: queryObject ? [getQueryFromQueryObject(queryObject)] : [],
      outFields: ['*'],
      authentication: this.authentication,
    };

    return new Find(this, query, { schema: this.schema, ajv: this.ajv });
  }

  findOne(queryObject) {
    const query = {
      filters: queryObject ? [getQueryFromQueryObject(queryObject)] : [],
      outFields: ['*'],
      findOne: true,
      authentication: this.authentication,
    };

    return new Find(this, query, { schema: this.schema, ajv: this.ajv });
  }

  applyEdits() {
    return new ApplyEdits(
      this,
      { schema: this.schema, ajv: this.ajv },
      this.authentication,
    );
  }

  deleteWhere(where) {
    return ApplyEdits.deleteWhere(this, where, this.authentication);
  }
}

export default FeatureLayer;
