import esriFetch from './esri-fetch';
import ContentItem from './content-item';

export class ContentManager {
  constructor(urlKey, customBaseUrl) {
    this.urlKey = urlKey;
    this.customBaseUrl = customBaseUrl;
  }

  async getItemById(id, token) {
    const requestUrl = `https://${this.urlKey}.${this.customBaseUrl}/sharing/rest/content/items/${id}`;

    let json;
    if (token) {
      json = await esriFetch(`${requestUrl}?f=json&token=${token}`);
    } else {
      json = await esriFetch(`${requestUrl}?f=json`);
    }

    const url = json.url;

    return new ContentItem(url, id);
  }
}

export default ContentManager;
