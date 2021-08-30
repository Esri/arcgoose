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

import parseCreate from '../apply-edits/parse-create';
import { wait } from '../../helpers/wait';
import { requestWithRetry } from '../../helpers/request-with-retry';

export class Append {
  constructor(featureLayer, { schema, ajv }, authentication) {
    this.featureLayer = featureLayer;
    this.schema = schema;
    this.ajv = ajv;
    this.edits = [];
    this.shouldUseGlobalIds = true;
    this.shouldRollbackOnFailure = false;
    this.authentication = authentication;
  }

  edits(features) {
    parseCreate(features, { schema: this.schema, ajv: this.ajv }).forEach(
      (feature) => {
        this.edits.push(feature);
      },
      this,
    );

    return this;
  }

  useGlobalIds() {
    this.shouldUseGlobalIds = true;
    return this;
  }

  useObjectIds() {
    this.shouldUseGlobalIds = false;
    return this;
  }

  rollbackOnFailure() {
    this.shouldRollbackOnFailure = true;
    return this;
  }

  async exec() {
    const query = {
      authentication: this.authentication,
      useGlobalIds: this.shouldUseGlobalIds,
      rollbackOnFailure: this.shouldRollbackOnFailure,
      edits: JSON.stringify(this.edits),
      upserts: true,
    };

    const result = await requestWithRetry(
      `${this.featureLayer.url}/append`,
      this.authentication,
      query,
    );
    let { status } = result;
    const { itemId } = result;

    console.log(status);

    while (status === 'processing') {
      // eslint-disable-next-line
      await wait(1000);

      // eslint-disable-next-line
      ({ status } = await requestWithRetry(
        `${this.featureLayer.url}/append/jobs/${itemId}`,
        this.authentication,
      ));

      console.log(status);
    }

    // TODO: handle status different from 'Complete';

    return status;
  }
}

export default Append;
