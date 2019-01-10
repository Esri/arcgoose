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


export class ApplyMultiLayerEdits {
  constructor(url, layers) {
    this.url = url;
    this.layers = layers;
    this.edits = layers.map(({ index }) => ({
      id: index,
      adds: [],
      deletes: [],
      updates: [],
    }));
  }

  add(layerId, features) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) throw new Error(`layer ${name} not found.`);


    const editLayer = this.edits.find(edit => edit.id === layer.index);
    if (!editLayer) throw new Error('Unknown error: this should not happen.');

    editLayer.adds.push(...parseCreate(features, layer.schema));
    return this;
  }

  update(layerId, features) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) throw new Error(`layer ${name} not found.`);

    const editLayer = this.edits.find(edit => edit.id === layer.index);
    if (!editLayer) throw new Error('Unknown error: this should not happen.');

    editLayer.updates.push(...parseUpdate(features, layer.schema));
    return this;
  }

  delete(layerId, idArray) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) throw new Error(`layer ${name} not found.`);

    const editLayer = this.edits.find(edit => edit.id === layer.index);
    if (!editLayer) throw new Error('Unknown error: this should not happen.');

    editLayer.deletes.push(...parseDelete(idArray));
    return this;
  }

  async exec() {
    const query = {
      useGlobalIds: true,
      rollbackOnFailure: false,
      edits: JSON.stringify(this.edits),
    };

    const editsResult = await requestWithRetry(`${this.url}/applyEdits`, {
      query
    });

    /* TODO: handle missing data field */

    return editsResult.map(layer => ({
      layerId: this.layers.find(l => l.index === layer.id) &&
        this.layers.find(l => l.index === layer.id).id,
      addedFeatures: processResults(layer.addResults),
      updatedFeatures: processResults(layer.updateResults),
      deletedFeatures: processResults(layer.deleteResults),
      addedOIDs: processResultsOIDs(layer.addResults),
    }))

    ;
  }
}

export default ApplyMultiLayerEdits;
