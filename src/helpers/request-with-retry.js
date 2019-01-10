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

import {
  REQUEST_MAX_RETRIES,
  REQUEST_RETRY_CODES,
} from '../constants';

import { request } from "@esri/arcgis-rest-request";

const wait = timeout => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, timeout);
});


export const requestWithRetry = async (url, params, inputTime) => {
  const time = inputTime ? inputTime + 1 : 1;
  try {
    return await request(url, { params });
  } catch (err) {
    console.error(err);
    if ((err.details && !REQUEST_RETRY_CODES.includes(err.details.httpStatus)) ||
      time > REQUEST_MAX_RETRIES) {
      throw (err);
    }

    // console.log(`ArcGoose: waiting ${2 ** time} before retrying query...`);

    await wait(2 ** time);
    return requestWithRetry(url, params, time);
  }
};

export default requestWithRetry;
