import {
  requestWithRetry,
} from '../helpers/request-with-retry';

import {
  processResults,
  processResultsOIDs,
} from './apply-edits/process-results';

export default async (handleArray) => {
  const edits = handleArray.map(handle => ({
    id: handle.payload.id,
    adds: handle.payload.adds,
    deletes: handle.payload.deletes,
    updates: handle.payload.updates,
  }));

  const query = {
    f: 'json',
    useGlobalIds: true,
    rollbackOnFailure: false,
    edits: JSON.stringify(edits),
  };

  const editsResult = await requestWithRetry(`${this.url}/applyEdits`, {
    query,
    method: 'post',
    responseType: 'json',
  });

  /* TODO: handle missing data field */

  return editsResult.data.map(layer => ({
    layerId: this.layers.find(l => l.index === layer.id) &&
      this.layers.find(l => l.index === layer.id).id,
    addedFeatures: processResults(layer.addResults),
    updatedFeatures: processResults(layer.updateResults),
    deletedFeatures: processResults(layer.deleteResults),
    addedOIDs: processResultsOIDs(layer.addResults),
  }));
};
