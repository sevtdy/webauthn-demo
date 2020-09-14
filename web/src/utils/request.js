import cbor from 'cbor';

const PREFIX = '/api';

const request = {};
const methods = ['get', 'post', 'put', 'delete', 'patch'];

methods.forEach((method) => {
  request[method] = (url, { body, params, headers }) => {
    if (params) {
      let p = new URLSearchParams();
      for (let [key, value] of Object.entries(params)) {
        p.append(key, value);
      }
      url = url + '?' + p.toString();
    }
    return fetch(PREFIX + url, {
      method: method,
      headers: {
        'content-type': 'application/cbor',
        ...headers,
      },
      body: body && cbor.encode(body),
    })
      .then((res) => res.arrayBuffer())
      .then((res) => cbor.decodeFirstSync(Buffer(res)));
  };
});

export default request;
