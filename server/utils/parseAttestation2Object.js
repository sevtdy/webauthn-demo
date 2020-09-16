import cbor from 'cbor';
import jwkToPem from 'jwk-to-pem';

function parseAuthData(buffer) {
  let rpIdHash = buffer.slice(0, 32);
  buffer = buffer.slice(32);
  let flagsBuf = buffer.slice(0, 1);
  buffer = buffer.slice(1);
  let flagsInt = flagsBuf[0];
  let flags = {
    up: !!(flagsInt & 0x01),
    uv: !!(flagsInt & 0x04),
    at: !!(flagsInt & 0x40),
    ed: !!(flagsInt & 0x80),
    flagsInt,
  };
  let counterBuf = buffer.slice(0, 4);
  buffer = buffer.slice(4);
  let counter = counterBuf.readUInt32BE(0);
  let aaguid = undefined;
  let credID = undefined;
  let COSEPublicKey = undefined;
  aaguid = buffer.slice(0, 16);
  buffer = buffer.slice(16);
  let credIDLenBuf = buffer.slice(0, 2);
  buffer = buffer.slice(2);
  let credIDLen = credIDLenBuf.readUInt16BE(0);
  credID = buffer.slice(0, credIDLen).toString('base64');
  buffer = buffer.slice(credIDLen);
  COSEPublicKey = buffer;
  let publicKeyPem = cose2Pem(buffer);

  return { rpIdHash, flags, counter, aaguid, credID, COSEPublicKey, publicKeyPem };
}

function cose2Pem(cose) {
  let jwk = {};
  let temp = cbor.decodeFirstSync(cose);
  if (temp.get(3) === -7) {
    jwk = {
      kty: 'EC',
      crv: 'P-256',
      x: temp.get(-2).toString('base64'),
      y: temp.get(-3).toString('base64'),
    };
  } else if (temp.get(3) === -257) {
    jwk = {
      kty: 'RSA',
      e: temp.get(-2).toString('base64'),
      n: temp.get(-1).toString('base64'),
    };
  }
  return jwkToPem(jwk);
}

export default function parseAttestation2Object(attestationCOBR) {
  let attestationObject = cbor.decodeFirstSync(attestationCOBR);
  let authData = parseAuthData(attestationObject.authData);
  return {
    ...attestationObject,
    authData,
  };
}
