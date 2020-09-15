import cbor from 'cbor';
import jwkToPem from 'jwk-to-pem';

function cose2Jwk(cose) {
  let jwk = {};
  let temp = cbor.decodeFirstSync(cose);
  // console.log(temp);
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
  // console.log(jwk, jwkToPem(jwk));s
  return jwkToPem(jwk);
}

export default function parseAttestation2Object(attestationCOBR) {
  let tempObj = cbor.decodeFirstSync(attestationCOBR);
  let authData = {
    rpIdHash: tempObj.authData.slice(0, 32),
    flags: tempObj.authData.slice(32, 33),
    counter: tempObj.authData.slice(33, 37).readUInt32BE(),
    aaguid: tempObj.authData.slice(37, 53),
    credIdLength: tempObj.authData.slice(53, 55).readUInt16BE(),
  };
  authData.credId = tempObj.authData.slice(55, 55 + authData.credIdLength).toString('base64');
  authData.COSEPublicKey = tempObj.authData.slice(55 + authData.credIdLength);
  authData.publicKey = cose2Jwk(authData.COSEPublicKey);
  // console.log(attestationCOBR, authData);
  return authData;
}
