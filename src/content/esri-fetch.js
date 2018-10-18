import fetch from 'isomorphic-fetch';

// Special fetch hack to avoid invalid json objects
// we cannot use
// const json = await response.json();
// because sometimes the HTTP reply, which is an invalid json ("xmin": NaN)

const esriFetch = async (url) => {
  const response = await fetch(url);
  const text = await response.text();

  const find = ':NaN';
  const re = new RegExp(find, 'g');

  const cleanText = text.replace(re, ':0');
  const json = JSON.parse(cleanText);
  return json;
};

export default esriFetch;
