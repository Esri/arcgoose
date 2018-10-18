import esriFetch from './esri-fetch';

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array); // eslint-disable-line
  }
}

export class ContentItem {
  constructor(url, id) {
    this.url = url;
    this.id = id;
  }

  async getMetaData(token) {
    let json;

    if (token) {
      json = await esriFetch(`${this.url}?f=json&token=${token}`);
    } else {
      json = await esriFetch(`${this.url}?f=json`);
    }
    return json;
  }

  async fetchLayers(layers, token) {
    const fetchedLayers = [];

    await asyncForEach(layers, async (layer) => {
      let layerInfo;
      if (token) {
        layerInfo = await esriFetch(`${this.url}/${layer.id}?f=json&token=${token}`);
      } else {
        layerInfo = await esriFetch(`${this.url}/${layer.id}?f=json`);
      }
      fetchedLayers.push(layerInfo);
    });

    return fetchedLayers;
  }

  async getExtendedMetaData(token) {
    const { layers, tables, ...metadata } = await this.getMetaData(token);

    const fetchedLayers = await this.fetchLayers(layers, token);
    const fetchedTables = await this.fetchLayers(tables, token);

    return {
      ...metadata,
      layers: fetchedLayers,
      tables: fetchedTables,
    };
  }
}

export default ContentItem;
