/* Copyright 2018-2019 Esri
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
import { request } from '@esri/arcgis-rest-request';

import {
  REQUEST_MAX_RETRIES,
  REQUEST_RETRY_CODES,
} from '../constants';

const wait = timeout => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, timeout);
});

export const requestWithRetry = async (url, authentication, params, inputTime) => {
  const time = inputTime ? inputTime + 1 : 1;
  try {
    return await request(url, { params, authentication });
  } catch (err) {
    // eslint-disable-next-line
    console.log(err);

    if (time > REQUEST_MAX_RETRIES) throw (err);

    if (err.message === 'Timeout exceeded' || REQUEST_RETRY_CODES.includes(err.details.httpStatus)) {
      // eslint-disable-next-line
      console.log(`ArcGoose: waiting ${2 ** time} ms before retrying query...`);
      await wait(2 ** time);
      return requestWithRetry(url, authentication, params, time);
    }

    throw (err);
  }
};

export default requestWithRetry;
