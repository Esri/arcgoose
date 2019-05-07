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


import {
  filterAttributes,
} from './filter-attributes';

import {
  fetchPagedFeatures,
} from './fetch-paged-features';

const fromAlias = (fieldName, schema) => {
  if (!schema) return fieldName;

  const originalKey = Object.keys(schema)
    .find(key => schema[key] && schema[key].alias === fieldName);

  return originalKey || fieldName;
};


export class Find {
  constructor(featureLayer, { filters, outFields, findOne }, schema) {
    this.featureLayer = featureLayer;
    this.query = {
      filters,
      outFields,
      returnGeometry: false,
      returnCentroid: false,
      inSR: 4326,
      outSR: 4326,
      ignoreServiceLimit: false,
    };
    this.findOne = !!findOne;
    this.schema = schema;
  }

  where(filter) {
    this.query.filters.push(filter);
    return this;
  }

  filter(filter) {
    this.query.filters.push(filter);
    return this;
  }

  populate(outFields) {
    this.query.outFields = outFields.map(field => fromAlias(field, this.schema));
    return this;
  }

  geometry(geometry, geometryType) {
    this.query.geometry = geometry;
    this.query.inSR = geometry.spatialReference.wkid;
    this.query.geometryType = geometryType;
    return this;
  }

  intersects() {
    this.query.spatialRel = 'esriSpatialRelIntersects';
    return this;
  }

  contains() {
    this.query.spatialRel = 'esriSpatialRelContains';
    return this;
  }

  returnGeometry() {
    this.query.returnGeometry = true;
    return this;
  }

  returnZ() {
    this.query.returnZ = true;
    return this;
  }

  returnCentroid() {
    this.query.returnCentroid = true;
    return this;
  }

  outSpatialReference(wkid) {
    this.query.outSR = wkid;
    return this;
  }

  sort(sortOrder) {
    if (sortOrder && typeof sortOrder === 'object') {
      this.query.orderByFields = Object.keys(sortOrder)
        .map(field => `${fromAlias(field, this.schema)} ${sortOrder[field] < 0 ? 'DESC' : 'ASC'}`)
        .join(', ');
    } // TODO: array and string syntax https://mongoosejs.com/docs/queries.html
    return this;
  }

  offset(amount) {
    if (amount && amount > 0) {
      this.query.resultOffset = amount;
    }
    return this;
  }

  limit(amount) {
    if (amount && amount > 0) {
      this.query.resultRecordCount = amount;
    }
    return this;
  }

  outStatistics(outStatistics, groupByFieldsForStatistics) {
    this.query.outStatistics = outStatistics;
    this.query.groupByFieldsForStatistics = groupByFieldsForStatistics;
    return this;
  }

  ignoreServiceLimit() {
    this.query.ignoreServiceLimit = true;
    return this;
  }

  returnCountOnly() {
    this.query.returnCountOnly = true;
    return this;
  }

  async exec() {
    const query = {
      f: 'json',
      where: this.query.filters
        .map(filter => `(${filter})`)
        .join(' AND ') || '1=1',
      geometry: JSON.stringify(this.query.geometry),
      geometryType: this.query.geometryType,
      outFields: this.query.outFields.join(','),
      returnGeometry: this.query.returnGeometry,
      returnZ: this.query.returnZ,
      returnCentroid: this.query.returnCentroid,
      outSR: this.query.outSR,
      inSR: this.query.inSR,
      spatialRel: this.query.spatialRel,
      orderByFields: this.query.orderByFields,
      resultOffset: this.query.resultOffset,
      resultRecordCount: this.query.resultRecordCount,
      outStatistics: JSON.stringify(this.query.outStatistics),
      returnCountOnly: this.query.returnCountOnly,
      groupByFieldsForStatistics: this.query.groupByFieldsForStatistics,
    };

    const featureData = await fetchPagedFeatures({
      featureLayerUrl: this.featureLayer.url,
      query,
      ignoreServiceLimit: this.query.ignoreServiceLimit,
    });

    if (this.query.returnCountOnly) {
      return featureData;
    }

    const features = featureData.allFeatures.map(({ attributes, geometry, centroid }) => ({
      attributes: this.query.outStatistics ?
        attributes :
        filterAttributes(attributes, {
          [this.featureLayer.objectIdField]: {
            type: Number,
            alias: 'esriObjectId',
          },
          ...this.schema,
        }),
      geometry: this.query.returnGeometry ? {
        ...geometry,
        spatialReference: {
          ...featureData.spatialReference,
        },
      } : null,
      centroid: this.query.returnCentroid ? {
        ...centroid,
        spatialReference: featureData.spatialReference,
      } : null,
    }));

    if (this.findOne) {
      if (features.length !== 1) {
        throw new Error('Not sure what to throw!');
      }

      return features[0];
    }

    return features;
  }
}

export default Find;
