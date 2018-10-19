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

import request from '../helpers/request-with-retry';


const fetchPortalItem = (portalUrl, portalItemId) =>
  request(`https://${portalUrl}/sharing/rest/content/items/${portalItemId}`);


const fetchFeatureServiceInfo = featureServiceUrl => request(featureServiceUrl);


const fetchLayers = (url, layers) => {
  if (!Array.isArray(layers)) return [];

  const results = [];
  layers.forEach(({ id }) => results.push(request(`${url}/${id}`)));

  return Promise.all(results);
};


export default async ({ url, portalUrl, portalItemId }) => {
  let featureServiceUrl = url;

  if (!featureServiceUrl) {
    const result = await fetchPortalItem(portalUrl, portalItemId);
    featureServiceUrl = result.data.url;
  }

  const result = await fetchFeatureServiceInfo(featureServiceUrl);
  const featureServiceInfo = result.data;
  const layers = await fetchLayers(featureServiceUrl, featureServiceInfo.layers);
  const tables = await fetchLayers(featureServiceUrl, featureServiceInfo.tables);

  return {
    ...featureServiceInfo,
    type: 'Feature Service',
    url: featureServiceUrl,
    layers: layers.map(layer => ({ ...layer.data, url: `${featureServiceUrl}/${layer.data.id}` })),
    tables: tables.map(table => ({ ...table.data, url: `${featureServiceUrl}/${table.data.id}` })),
  };
};
