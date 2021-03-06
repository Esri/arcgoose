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

import { requestWithRetry } from '../../helpers/request-with-retry';

export const fetchPagedFeatures = async (
  url,
  authentication,
  query,
  inputTime,
) => {
  let exceededTransferLimit = true;
  const features = [];
  let spatialReference = null;
  let objectIdFieldName = null;

  let recordCount = query.resultRecordCount;
  let offset = query.resultOffset;

  while (exceededTransferLimit) {
    // eslint-disable-next-line no-await-in-loop
    const findResult = await requestWithRetry(
      url,
      authentication,
      query,
      inputTime,
    );

    features.push(...findResult.features);
    spatialReference = findResult.spatialReference;
    objectIdFieldName = findResult.objectIdFieldName;

    exceededTransferLimit = findResult.exceededTransferLimit === true;

    if (exceededTransferLimit) {
      const featureCount = findResult.features.length;

      // subtracting already fetched feature count, if a .limit was set
      if (recordCount > 0) {
        recordCount -= featureCount;

        if (recordCount <= 0) break;
      }

      if (isNaN(offset)) offset = 0;

      offset += featureCount;

      query.resultRecordCount = recordCount;
      query.resultOffset = offset;
    }
  }

  return {
    features,
    spatialReference,
    objectIdFieldName,
  };
};

export default fetchPagedFeatures;
