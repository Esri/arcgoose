/* Copyright 2019 Esri
 * Beda Kuster
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
} from '../../helpers/request-with-retry';


export const fetchPagedFeatures = async ({ featureLayerUrl, query, ignoreServiceLimit }) => {
  let exceededTransferLimit = true;
  const allFeatures = [];
  let spatialReference = null;

  while (exceededTransferLimit) {
    // eslint-disable-next-line no-await-in-loop
    const findResult = await requestWithRetry(`${featureLayerUrl}/query`, {
      query,
      method: 'get',
      responseType: 'json',
    });

    if (query.returnCountOnly) {
      return findResult.data;
    }

    allFeatures.push(...findResult.data.features);
    spatialReference = findResult.data.spatialReference;

    if (!ignoreServiceLimit) break;

    exceededTransferLimit = findResult.data.exceededTransferLimit === true;

    if (exceededTransferLimit) {
      const featureCount = findResult.data.features.length;

      // subtracting already fetched feature count, if a .limit was set
      if (query.resultRecordCount > 0) {
        query.resultRecordCount -= featureCount;

        if (query.resultRecordCount <= 0) break;
      }

      if (isNaN(query.resultOffset)) {
        query.resultOffset = 0;
      }

      query.resultOffset += featureCount;
    }
  }

  return {
    allFeatures,
    spatialReference,
  };
};

export default fetchPagedFeatures;
