/* Copyright 2018 Esri
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

import {
  processResults,
  processResultsOIDs,
} from './process-results';

import {
  requestWithRetry,
} from '../../helpers/request-with-retry';

export class ApplyEdits {
  static async deleteWhere(featureLayer, where) {
    const editsResult = await requestWithRetry(`${featureLayer.url}/deleteFeatures`, {
      query: {
        f: 'json',
        where,
      },
      method: 'post',
      responseType: 'json',
    });

    return {
      layerId: featureLayer.id,
      deletedFeatures: processResults(editsResult.data.deleteResults),
    };
  }

  constructor(featureLayer, schema) {
    this.featureLayer = featureLayer;
    this.schema = schema;
    this.adds = [];
    this.deletes = [];
    this.updates = [];
    this.useGlobalIds = true;
  }

  add(features) {
    this.adds.push(...parseCreate(features, this.schema));
    return this;
  }

  update(features) {
    this.updates.push(...parseUpdate(features, this.schema));
    return this;
  }

  delete(idArray) {
    this.deletes.push(...parseDelete(idArray));
    return this;
  }

  useGlobalIds() {
    this.useGlobalIds = true;
    return this;
  }

  useObjectIds() {
    this.useGlobalIds = false;
    return this;
  }

  handle() {
    return {
      serviceUrl: this.featureLayer.serviceUrl,
      name: this.featureLayer.name,
      payload: {
        id: this.featureLayer.id,
        adds: this.adds.length ? this.adds : null,
        updates: this.updates.length ? this.updates : null,
        deletes: this.deletes.length ? this.deletes : null,
      },
    };
  }

  async exec() {
    const query = {
      useGlobalIds: this.useGlobalIds,
      rollbackOnFailure: false,
      adds: this.adds.length ? JSON.stringify(this.adds) : null,
      updates: this.updates.length ? JSON.stringify(this.updates) : null,
      deletes: this.deletes.length ? this.deletes.map(id => `"${id}"`).join(',') : null,
    };

    const editsResult = await requestWithRetry(`${this.featureLayer.url}/applyEdits`, {
      query
    });

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
