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

  try {
    return await request(url, params);
  } catch (err) {
    if (!REQUEST_RETRY_CODES.includes(err.details.httpStatus) ||
      time > REQUEST_MAX_RETRIES) {
      throw (err);
    }

    // console.log(`ArcGoose: waiting ${2 ** time} before retrying query...`);

    await wait(2 ** time);
    return requestWithRetry(url, params, time);
  }
};

export default requestWithRetry;
