import esriLoader from 'esri-loader';

import requestWithRetry from '../request-with-retry';

jest.mock('esri-loader', () => {
  const request = jest.fn();

  return {
    request,
    loadModules: jest.fn(() => Promise.resolve([request])),
  };
});

describe('request with retry', () => {
  it('should be able to request without exception', async () => {
    const responseData = { data: '1234' };
    const [request] = await esriLoader.loadModules(['esri/request']);
    request.mockReturnValue(responseData);

    const url = 'http://foo.com';
    const params = { foo: 'bar' };
    const inputTime = 0;
    const r = await requestWithRetry(url, params, inputTime);

    expect(request).toHaveBeenCalledWith(url, {
      foo: 'bar',
      f: 'json',
      responseType: 'json',
    });
    expect(r).toEqual(responseData);
  });
});
