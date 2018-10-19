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
  request(`https://${portalUrl}/sharing/rest/content/items/${portalItemId}?f=json`);


const fetchFeatureServiceInfo = featureServiceUrl => request(`${featureServiceUrl}?f=json`);


const fetchLayers = (url, layers) => {
  if (!Array.isArray(layers)) return [];

  const results = [];
  layers.forEach(({ id }) => results.push(request(`${url}/${id}?f=json`)));

  return Promise.all(results);
};


export default async ({ url, portalUrl, portalItemId }) => {
  let featureServiceUrl = url;

  if (!featureServiceUrl) {
    const result = await fetchPortalItem(portalUrl, portalItemId);
    featureServiceUrl = result.data.url;
  }

  const result = await fetchFeatureServiceInfo(featureServiceUrl);
  const featureServiceInfo = {
    ...result.data,
    type: 'Feature Service',
    url: featureServiceUrl,
    layers: {},
    tables: {},
  };

  const layers = await fetchLayers(featureServiceUrl, result.data.layers);
  const tables = await fetchLayers(featureServiceUrl, result.data.tables);

  layers.forEach(layer => featureServiceInfo.layers[layer.data.name] = {
    ...layer.data,
    url: `${featureServiceUrl}/${layer.data.id}`,
    serviceUrl: `${featureServiceUrl}/${layer.data.id}`,
  });
  tables.forEach(table => featureServiceInfo.tables[table.data.name] = {
    ...table.data,
    url: `${featureServiceUrl}/${table.data.id}`,
    serviceUrl: `${featureServiceUrl}/${layer.data.id}`,
  });

  return featureServiceInfo;
};
