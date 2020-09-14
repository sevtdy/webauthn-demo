import cbor from 'cbor';

const encodeRes2Cbor = function (req, res, next) {
  let originSend = res.send;
  res.set({ 'Content-Type': 'application/cbor' });
  res.send = function () {
    arguments[0] = cbor.encode(arguments[0]);
    originSend.apply(res, arguments);
  };
  next();
};

export default encodeRes2Cbor;
