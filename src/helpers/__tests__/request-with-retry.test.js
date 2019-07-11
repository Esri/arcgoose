import requestWithRetry from '../request-with-retry';

jest.mock('@esri/arcgis-rest-request');
import { request } from '@esri/arcgis-rest-request';

describe('request with retry', () => {
  it('should be able to request without exception', async () => {
    const responseData = '1234';
    request.mockReturnValue(Promise.resolve(responseData));

    const url = 'http://foo.com';
    const params = { foo: 'bar' };
    const inputTime = 0;

    await expect(requestWithRetry(url, params, inputTime)).resolves.toEqual(responseData);

    expect(request).toHaveBeenCalledWith(url, {
      params: { 
        foo: 'bar'
      }
    });
  });
});
