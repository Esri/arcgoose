import Find from './find';
import ApplyEdits from './apply-edits';


const parseValue = value => (typeof (value) === 'string' ? `'${value}'` : `${value}`);


const getQueryFromQueryObject = queryObject => Object.keys(queryObject)
  .map(key => `${key} = ${parseValue(queryObject[key])}`)
  .join(' AND ');


const getFieldsFromSchema = schema => Object.keys(schema);


export class FeatureLayer {
  constructor({ url, schema, layerId }) {
    this.type = 'layer';
    this.url = url;
    this.schema = schema;
    this.id = layerId;
  }


  find(queryObject) {
    const query = {
      filters: queryObject ? [getQueryFromQueryObject(queryObject)] : [],
      outFields: this.schema ? getFieldsFromSchema(this.schema) : ['*'],
    };

    return new Find(this, query, this.schema);
  }

  findOne(queryObject) {
    const query = {
      filters: queryObject ? [getQueryFromQueryObject(queryObject)] : [],
      outFields: this.schema ? getFieldsFromSchema(this.schema) : ['*'],
      findOne: true,
    };

    return new Find(this, query, this.schema);
  }

  applyEdits() {
    return new ApplyEdits(this, this.schema);
  }

}

export default FeatureLayer;
