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

import parseCreate from './parse-create';
import parseUpdate from './parse-update';
import parseDelete from './parse-delete';

import { processResults, processResultsOIDs } from './process-results';

import { requestWithRetry } from '../../helpers/request-with-retry';

export class ApplyEdits {
  static async deleteWhere(featureLayer, where, authentication) {
    const editsResult = await requestWithRetry(
      `${featureLayer.url}/deleteFeatures`,
      authentication,
      { where, rollbackOnFailure: true },
    );

    return {
      layerId: featureLayer.id,
      deletedFeatures: processResults(editsResult.deleteResults),
    };
  }

  constructor(featureLayer, { schema, ajv }, authentication) {
    this.featureLayer = featureLayer;
    this.schema = schema;
    this.ajv = ajv;
    this.adds = [];
    this.deletes = [];
    this.updates = [];
    this.shouldUseGlobalIds = true;
    this.shouldRollbackOnFailure = false;
    this.authentication = authentication;
  }

  add(features) {
    this.adds.push(
      ...parseCreate(features, { schema: this.schema, ajv: this.ajv }),
    );
    return this;
  }

  update(features) {
    this.updates.push(
      ...parseUpdate(features, { schema: this.schema, ajv: this.ajv }),
    );
    return this;
  }

  delete(idArray) {
    this.deletes.push(...parseDelete(idArray));
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

  rollbackOnFailure(setting) {
    this.shouldRollbackOnFailure = setting;
    return this;
  }

  handle() {
    return {
      serviceUrl: this.featureLayer.serviceUrl,
      name: this.featureLayer.name,
      authentication: this.authentication,
      payload: {
        id: this.featureLayer.id,
        adds: this.adds.length ? this.adds : null,
        updates: this.updates.length ? this.updates : null,
        deletes: this.deletes.length ? this.deletes : null,
      },
    };
  }

  async exec() {
    let deleteIds = null;
    if (this.deletes.length) {
      if (this.shouldUseGlobalIds) {
        deleteIds = this.deletes.map((id) => `"${id}"`).join(',');
      } else {
        deleteIds = this.deletes.map((id) => `${id}`).join(',');
      }
    }

    const query = {
      authentication: this.authentication,
      useGlobalIds: this.shouldUseGlobalIds,
      rollbackOnFailure: this.shouldRollbackOnFailure,
      adds: this.adds.length ? JSON.stringify(this.adds) : null,
      updates: this.updates.length ? JSON.stringify(this.updates) : null,
      deletes: deleteIds,
    };

    const editsResult = await requestWithRetry(
      `${this.featureLayer.url}/applyEdits`,
      this.authentication,
      query,
    );

    /* TODO: handle missing data field */

    return {
      layerId: this.featureLayer.id,
      addedFeatures: processResults(editsResult.addResults),
      updatedFeatures: processResults(editsResult.updateResults),
      deletedFeatures: processResults(editsResult.deleteResults),
      addedOIDs: processResultsOIDs(editsResult.addResults),
    };
  }
}

export default ApplyEdits;
