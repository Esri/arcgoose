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

import { requestWithRetry } from '../helpers/request-with-retry';

import {
  processResults,
  processResultsOIDs,
} from './apply-edits/process-results';

const CHUNK_SIZE = 500;

const flattenEditHandles = (handleArray) => {
  const editsArray = [];

  handleArray.forEach((handle) => {
    editsArray.push(
      ...(handle.payload.adds || []).map((payload) => ({
        id: handle.payload.id,
        type: 'adds',
        payload,
      })),
    );
    editsArray.push(
      ...(handle.payload.deletes || []).map((payload) => ({
        id: handle.payload.id,
        type: 'deletes',
        payload,
      })),
    );
    editsArray.push(
      ...(handle.payload.updates || []).map((payload) => ({
        id: handle.payload.id,
        type: 'updates',
        payload,
      })),
    );
  });

  return editsArray;
};

const expandEditsSingle = (editsArray, type) => {
  const outputArray = editsArray
    .filter((i) => i.type === type)
    .map((i) => i.payload);
  return outputArray.length > 0 ? outputArray : null;
};

const expandEditsId = (id, editsArray) => ({
  id,
  adds: expandEditsSingle(editsArray, 'adds'),
  deletes: expandEditsSingle(editsArray, 'deletes'),
  updates: expandEditsSingle(editsArray, 'updates'),
});

const expandEdits = (editsArray) => {
  const edits = [];
  const ids = new Set(editsArray.map((i) => i.id));
  ids.forEach((id) =>
    edits.push(
      expandEditsId(
        id,
        editsArray.filter((i) => i.id === id),
      ),
    ),
  );
  return edits;
};

const getChunks = (inputArray) => {
  const chunks = [];
  let i = 0;
  const n = inputArray.length;

  while (i < n) {
    chunks.push(inputArray.slice(i, (i += CHUNK_SIZE)));
  }

  return chunks;
};

export default async (handleArray, progressCallback) => {
  if (handleArray.length < 1) return null;

  const serviceUrl = handleArray[0].serviceUrl;
  const authentication = handleArray[0].authentication;

  const editsArray = flattenEditHandles(handleArray);
  const editChunks = getChunks(editsArray);

  const editsResultsArray = [];

  for (let i = 0; i < editChunks.length; i += 1) {
    const edits = expandEdits(editChunks[i]);
    const query = {
      useGlobalIds: true,
      rollbackOnFailure: true,
      edits: JSON.stringify(edits),
    };

    // eslint-disable-next-line
    const result = await requestWithRetry(
      `${serviceUrl}/applyEdits`,
      authentication,
      query,
    );

    editsResultsArray.push(result);

    if (progressCallback) {
      progressCallback((i + 1) / editChunks.length);
    }
  }

  // TODO: this should handle if layer.id already exists in editsResult
  const editsResults = [];
  editsResultsArray.forEach((result) =>
    editsResults.push(
      ...result.map((layer) => ({
        layerId: layer.id,
        layerName: (
          handleArray.find((handle) => handle.payload.id === layer.id) || {}
        ).name,
        addedFeatures: processResults(layer.addResults),
        updatedFeatures: processResults(layer.updateResults),
        deletedFeatures: processResults(layer.deleteResults),
        addedOIDs: processResultsOIDs(layer.addResults),
      })),
    ),
  );

  return editsResults;
};
