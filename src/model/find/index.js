
import {
  filterAttributes,
} from './filter-attributes';

import {
  requestWithRetry,
} from '../../helpers/request-with-retry';


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
      returnCentroid: this.query.returnCentroid,
      outSR: this.query.outSR,
      inSR: this.query.inSR,
      spatialRel: this.query.spatialRel,
      orderByFields: this.query.orderByFields,
      resultRecordCount: this.query.resultRecordCount,
      outStatistics: JSON.stringify(this.query.outStatistics),
      groupByFieldsForStatistics: this.query.groupByFieldsForStatistics,
    };

    const findResult = await requestWithRetry(`${this.featureLayer.url}/query`, {
      query,
      method: 'get',
      responseType: 'json',
    });

    const features = findResult.data.features.map(({ attributes, geometry, centroid }) => ({
      attributes: filterAttributes(attributes, this.schema),
      geometry: this.query.returnGeometry ? {
        ...geometry,
        spatialReference: {
          ...findResult.data.spatialReference,
        },
      } : null,
      centroid: this.query.returnCentroid ? {
        ...centroid,
        spatialReference: findResult.data.spatialReference,
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
