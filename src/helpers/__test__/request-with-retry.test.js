import requestWithRetry from '../request-with-retry';

import { request } from "@esri/arcgis-rest-request";

jest.mock('request',
  () => jest.fn().mockImplementation(() => ({ foo: 'bar' })),
  { virtual: true },
);

describe('request with retry', () => {
  it('should be able to request without exception', async () => {
    const responseData = '1234';
    // const [request] = await esriLoader.loadModules(['esri/request']);
    request.mockReturnValue(responseData);

    const url = 'http://foo.com';
    const params = { foo: 'bar' };
    const inputTime = 0;
    const r = await requestWithRetry(url, params, inputTime);

    expect(request).toHaveBeenCalledWith(url, {
      foo: 'bar'
    });
    expect(r).toEqual(responseData);
  });
});
