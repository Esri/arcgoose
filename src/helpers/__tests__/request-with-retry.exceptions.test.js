import requestWithRetry from '../request-with-retry';

import {
  REQUEST_RETRY_CODES,
} from '../../constants';

jest.mock('@esri/arcgis-rest-request');
import { request } from '@esri/arcgis-rest-request';

describe('request with retry with exceptions', () => {
  
  it('should be able to request with error', async () => {
    const responseData = { data: '1234' };

    request
      .mockImplementationOnce(() => {
        throw {
          details: {
            httpStatus: REQUEST_RETRY_CODES[0],
          },
        };
      })
      .mockImplementationOnce(() => responseData);

    const url = 'http://foo.com';
    const params = { foo: 'bar' };
    const inputTime = 0;
    const r = await requestWithRetry(url, params, inputTime);

    expect(request).toHaveBeenCalledWith(url, {
      params: {
        foo: 'bar'
      }
    });
    expect(r).toEqual(responseData);
  });

  it('should not be able to request with other errors', async () => {
    request
      .mockImplementationOnce(() => {
        throw {
          details: {
            httpStatus: 999,
          },
        };
      });

    const url = 'http://foo.com';
    const params = { foo: 'bar' };
    const inputTime = 0;
    try {
      await requestWithRetry(url, params, inputTime);
    } catch (err) {
      expect(err.details.httpStatus).toEqual(999);
    }
  });
});
