// import esriLoader from 'esri-loader';

import FeatureLayer from '../feature-layer';

jest.mock('esri/layers/FeatureLayer', () => {
  const EsriFeatureLayerMock = jest.fn();
  return EsriFeatureLayerMock;
}, { virtual: true });

jest.mock('esri-loader', () => {
  const request = jest.fn();

  request.mockImplementation(() => ('foobar'));

  return { request };
});

// jest.mock('esri/request',
//   () => jest.fn().mockImplementation(() => ({ data: 'blab' })),
//   { virtual: true },
// );

describe('Edits', () => {
  it('applies an edit to the attributes of one feature', async () => {
    const layer = new FeatureLayer({
      url: 'http://blabla.com/layer/0',
      serviceUrl: 'http://blabla.com/layer/',
      id: '0',
      schema: { GlobalID: String, name: String },
      other: 'stuff',
    });

    await layer.applyEdits()
      .update({ attributes: { GlobalID: '1', name: 'New Name' } })
      .exec();

    expect(request).toHaveBeenCalledWith('http://blabla.com/layer/0/applyEdits', {
      useGlobalIds: true,
      rollbackOnFailure: false,
      adds: null,
      updates: '[{"attributes":{"GlobalID":"1","name":"New Name"}}]',
      deletes: null
    });
  });

  it('applies an edit to the attributes of several features', async () => {
    const layer = new FeatureLayer({
      url: 'http://blabla.com/layer/0',
      serviceUrl: 'http://blabla.com/layer/',
      id: '0',
      schema: { GlobalID: String, name: String },
      other: 'stuff',
    });

    await layer.applyEdits()
      .update([
        { attributes: { GlobalID: '1', name: 'New Name 1' } },
        { attributes: { GlobalID: '2', name: 'New Name 2' } },
      ])
      .exec();

    expect(request).toHaveBeenCalledWith('http://blabla.com/layer/0/applyEdits', {
      useGlobalIds: true,
      rollbackOnFailure: false,
      adds: null,
      updates: '[{"attributes":{"GlobalID":"1","name":"New Name 1"}},{"attributes":{"GlobalID":"2","name":"New Name 2"}}]',
      deletes: null,
    });
  });
});
