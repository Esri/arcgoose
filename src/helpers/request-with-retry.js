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

import esriLoader from 'esri-loader';

import {
  REQUEST_MAX_RETRIES,
  REQUEST_RETRY_CODES,
} from '../constants';


const wait = timeout => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, timeout);
});


const addCacheRefreshParamToUrl = (url, time) => `${url}${url.includes('&') ? '?' : '&'}cacheRefresh=${time}`;


export const requestWithRetry = async (url, params, inputTime) => {
  const time = inputTime ? inputTime + 1 : 1;
  const [request] = await esriLoader.loadModules(['esri/request']);

  try {
    const requestUrl = time > 1 ? addCacheRefreshParamToUrl(url, time) : url;
    const response = await request(requestUrl, {
      ...params,
      f: 'json',
      responseType: 'json',
    });

    if (response.error && REQUEST_RETRY_CODES.includes(response.error.code)) {
      throw new Error({
        ...response.error,
        details: {
          ...response.error.details,
          httpStatus: response.error.code,
        },
      });
    }

    return response;
  } catch (err) {
    // eslint-disable-next-line
    console.log(err);

    if (time > REQUEST_MAX_RETRIES) throw (err);

    if (err.message === 'Timeout exceeded' || REQUEST_RETRY_CODES.includes(err.details.httpStatus)) {
      // eslint-disable-next-line
      console.log(`ArcGoose: waiting ${2 ** time} ms before retrying query...`);
      await wait(2 ** time);
      return requestWithRetry(url, params, time);
    }

    throw (err);
  }
};

export default requestWithRetry;
