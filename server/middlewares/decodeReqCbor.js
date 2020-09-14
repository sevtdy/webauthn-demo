import cbor from 'cbor';

const decodeReqCbor = function (req, res, next) {
  if (req.headers['content-type'] || req.headers['Content-Type'] === 'application/cbor') {
    req.body = cbor.decodeFirstSync(req.body);
  }
  next();
};

export default decodeReqCbor;
