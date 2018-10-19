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


export const requestWithRetry = async (url, params, inputTime) => {
  const time = inputTime ? inputTime + 1 : 1;
  const [request] = await esriLoader.loadModules(['esri/request']);

  let requestUrl = url;
  if (requestUrl.split('f=json').length === 1) {
    if (requestUrl.includes('?')) {
      requestUrl += '&f=json';
    } else {
      requestUrl += '?f=json';
    }
  }

  try {
    return await request(requestUrl, {
      ...params,
      f: 'json',
      responseType: 'json',
    });
  } catch (err) {
    console.error(err);
    if ((err.details && !REQUEST_RETRY_CODES.includes(err.details.httpStatus)) ||
      time > REQUEST_MAX_RETRIES) {
      throw (err);
    }

    // console.log(`ArcGoose: waiting ${2 ** time} before retrying query...`);

    await wait(2 ** time);
    return requestWithRetry(requestUrl, params, time);
  }
};

export default requestWithRetry;
