import esriFetch from '../content/esri-fetch';

export class Address {
  constructor(filter, extent) {
    this.filter = filter;
    this.extent = extent;
  }

  async getAddress() {
    const address = await esriFetch(`http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&SingleLine=${this.filter}&searchExtent=${this.extent}&maxLocations=5`);
    return address;
  }

}

export default Address;
