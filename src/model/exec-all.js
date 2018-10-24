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

import {
  requestWithRetry,
} from '../helpers/request-with-retry';

import {
  processResults,
  processResultsOIDs,
} from './apply-edits/process-results';

export default async (handleArray) => {
  if (handleArray.length < 1) return null;

  const serviceUrl = handleArray[0].serviceUrl;

  const edits = handleArray
    .map(handle => ({
      id: handle.payload.id,
      adds: handle.payload.adds,
      deletes: handle.payload.deletes,
      updates: handle.payload.updates,
    }))
    .filter(handle => handle.adds || handle.deletes || handle.updates);

  const query = {
    f: 'json',
    useGlobalIds: true,
    rollbackOnFailure: false,
    edits: JSON.stringify(edits),
  };

  const editsResult = await requestWithRetry(`${serviceUrl}/applyEdits`, {
    query,
    method: 'post',
    responseType: 'json',
  });

  return editsResult.data.map(layer => ({
    layerId: layer.id,
    layerName: (handleArray.find(handle => handle.payload.id === layer.id) || {}).name,
    addedFeatures: processResults(layer.addResults),
    updatedFeatures: processResults(layer.updateResults),
    deletedFeatures: processResults(layer.deleteResults),
    addedOIDs: processResultsOIDs(layer.addResults),
  }));
};
