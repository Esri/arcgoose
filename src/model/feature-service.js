import Find from './find';
import ApplyMultiLayerEdits from './apply-edits/multi';


const parseValue = value => (typeof (value) === 'string' ? `'${value}'` : `${value}`);


const getQueryFromQueryObject = queryObject => Object.keys(queryObject)
  .map(key => `${key} = ${parseValue(queryObject[key])}`)
  .join(' AND ');


const getFieldsFromSchema = schema => Object.keys(schema);


export class FeatureService {
  constructor(url, layers) {
    this.url = url;
    this.layers = [];

    layers.forEach(({ id, name, type, schema }) => {
      const layer = {
        id: name,
        index: id,
        url: `${url}/${id}`,
        type,
        schema,
      };

      this.layers.push(layer);
    });
  }

  getLayer(id) {
    return this.layers.find(layer => layer.id === id);
  }

  find(layerId, queryObject) {
    const layer = this.getLayer(layerId);
    if (!layer) throw new Error(`layer ${layerId} not found.`);

    const query = {
      filters: queryObject ? [getQueryFromQueryObject(queryObject)] : [],
      outFields: getFieldsFromSchema(layer.schema),
    };

    return new Find(layer, query, layer.schema);
  }

  findOne(layerId, queryObject) {
    const layer = this.getLayer(layerId);
    if (!layer) throw new Error(`layer ${layerId} not found.`);

    const query = {
      filters: queryObject ? [getQueryFromQueryObject(queryObject)] : [],
      outFields: getFieldsFromSchema(layer.schema),
      findOne: true,
    };

    return new Find(layer, query, layer.schema);
  }

  applyEdits() {
    return new ApplyMultiLayerEdits(this.url, this.layers);
  }

}

export default FeatureService;
