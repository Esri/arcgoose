import { request } from '@esri/arcgis-rest-request';

import FeatureLayer from '../feature-layer';

jest.mock('@esri/arcgis-rest-request');

jest.mock('esri/layers/FeatureLayer', () => {
  const EsriFeatureLayerMock = jest.fn();
  return EsriFeatureLayerMock;
}, { virtual: true });

describe('Edits', () => {
  it('applies an edit to the attributes of one feature', async () => {
    request.mockReturnValue(Promise.resolve({
      updateResults: [{
        GlobalId: 1,
        success: true,
      }],
    }));

    const layer = new FeatureLayer({
      url: 'http://blabla.com/layer/0',
      serviceUrl: 'http://blabla.com/layer/',
      id: '0',
      schema: {
        type: 'object',
        properties: {
          GlobalID: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
        },
      },
      other: 'stuff',
    });

    await layer.applyEdits()
      .update({ attributes: { GlobalID: '1', name: 'New Name' } })
      .exec();

    expect(request).toHaveBeenCalledWith('http://blabla.com/layer/0/applyEdits', {
      params: {
        useGlobalIds: true,
        rollbackOnFailure: false,
        adds: null,
        updates: '[{"attributes":{"GlobalID":"1","name":"New Name"}}]',
        deletes: null,
      },
    });
  });

  it('applies an edit to the attributes of several features', async () => {
    request.mockReturnValue(Promise.resolve({
      updateResults: [{
        GlobalId: 1,
        success: true,
      }, {
        GlobalId: 2,
        success: true,
      }],
    }));

    const layer = new FeatureLayer({
      url: 'http://blabla.com/layer/0',
      serviceUrl: 'http://blabla.com/layer/',
      id: '0',
      schema: {
        type: 'object',
        properties: {
          GlobalID: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
        },
      },
      other: 'stuff',
    });

    await layer.applyEdits()
      .update([
        { attributes: { GlobalID: '1', name: 'New Name 1' } },
        { attributes: { GlobalID: '2', name: 'New Name 2' } },
      ])
      .exec();

    expect(request).toHaveBeenCalledWith('http://blabla.com/layer/0/applyEdits', {
      params: {
        useGlobalIds: true,
        rollbackOnFailure: false,
        adds: null,
        updates: '[{"attributes":{"GlobalID":"1","name":"New Name 1"}},{"attributes":{"GlobalID":"2","name":"New Name 2"}}]',
        deletes: null,
      },
    });
  });
});
