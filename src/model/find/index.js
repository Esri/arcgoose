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

import { filterAttributes } from './filter-attributes';

import { fetchPagedFeatures } from './fetch-paged-features';

import { requestWithRetry } from '../../helpers/request-with-retry';
import { ajv } from '../../helpers/validate';

const fromAlias = (fieldName, schema) => {
  if (!schema) return fieldName;

  const originalKey = Object.keys(schema.properties).find(
    (key) =>
      schema.properties[key] && schema.properties[key].alias === fieldName,
  );

  return originalKey || fieldName;
};

export class Find {
  constructor(featureLayer, { findOne, ...query }, schema) {
    this.featureLayer = featureLayer;
    this.query = {
      ...query,
      returnGeometry: false,
      returnCentroid: false,
      inSR: 4326,
      outSR: 4326,
    };
    this.findOne = !!findOne;
    this.schema = schema;
    this.validation = false;
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
    this.query.outFields = outFields.map((field) =>
      fromAlias(field, this.schema),
    );
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
        .map(
          (field) =>
            `${fromAlias(field, this.schema)} ${
              sortOrder[field] < 0 ? 'DESC' : 'ASC'
            }`,
        )
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

  returnCountOnly() {
    this.query.returnCountOnly = true;
    return this;
  }

  validate() {
    this.validation = true;
    return this;
  }

  async exec() {
    const query = {
      where:
        this.query.filters.map((filter) => `(${filter})`).join(' AND ') ||
        '1=1',
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

    const queryUrl = `${this.featureLayer.url}/query`;

    if (this.query.returnCountOnly) {
      const count = await requestWithRetry(
        queryUrl,
        this.query.authentication,
        query,
      );
      return count;
    }

    const featureData = await fetchPagedFeatures(
      queryUrl,
      this.query.authentication,
      query,
    );

    const objectIdField = featureData.objectIdFieldName;

    const { required, ...schema } = this.schema;

    const validator =
      this.validation && this.schema
        ? ajv.compile({
            ...schema,
            required: this.query.outFields ? [] : required,
            properties: {
              [objectIdField]: {
                type: 'integer',
                alias: 'esriObjectId',
              },
              ...schema.properties,
            },
          })
        : null;

    const features = featureData.features.map(
      ({ attributes, geometry, centroid }) => ({
        ...(this.query.outStatistics
          ? { attributes }
          : filterAttributes(attributes, this.schema, validator)),
        geometry: this.query.returnGeometry
          ? {
              ...geometry,
              spatialReference: {
                ...featureData.spatialReference,
              },
            }
          : null,
        centroid: this.query.returnCentroid
          ? {
              ...centroid,
              spatialReference: featureData.spatialReference,
            }
          : null,
      }),
    );

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
