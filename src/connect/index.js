/* Copyright 2019 Esri
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

import { getItem } from '@esri/arcgis-rest-portal';
import request from '../helpers/request-with-retry';

export default async ({ url, portal, portalItemId, authentication }) => {
  const featureService = url ? { url } : await getItem(portalItemId, {
    portal,
    authentication,
  });

  const service = await request(featureService.url, authentication);
  if (service.error) throw new Error(service.error);

  const featureServiceInfo = {
    ...service,
    authentication,
    type: 'Feature Service',
    url: featureService.url,
    access: featureService.access,
    owner: featureService.owner,
    isOrgItem: featureService.isOrgItem,
    orgId: featureService.orgId,
    capabilities: {
      create: service.capabilities.includes('Create'),
      query: service.capabilities.includes('Query'),
      update: service.capabilities.includes('Update'),
      delete: service.capabilities.includes('Delete'),
      editing: service.capabilities.includes('Editing'),
    },
    layers: {},
    tables: {},
  };

  service.layers.forEach(layer => featureServiceInfo.layers[layer.name] = {
    ...layer,
    authentication,
    url: `${featureService.url}/${layer.id}`,
    serviceUrl: featureService.url,
    type: 'Feature Layer',
  });
  service.tables.forEach(table => featureServiceInfo.tables[table.name] = {
    ...table,
    authentication,
    url: `${featureService.url}/${table.id}`,
    serviceUrl: featureService.url,
    type: 'Table',
  });


  return featureServiceInfo;
};
