import express from 'express';
import crypto from 'crypto';
import db from '../db.js';
import parseAttestation2Object from '../utils/parseAttestation2Object.js';

const router = express.Router();

router.post('/challenge', function (req, res) {
  let { username } = req.body;
  if (!db[username]) {
    db[username] = {
      username,
      id: crypto.randomBytes(16).toString('base64'),
      challenge: crypto.randomBytes(32),
    };
  } else {
    db[username].challenge = crypto.randomBytes(32);
  }

  res.send({
    challenge: db[username].challenge,
    rp: {
      name: 'WebAuthn Demo',
      id: 'localhost',
    },
    user: {
      id: Buffer.from(db[username].id, 'base64'),
      name: username,
      displayName: 'displayname' + username,
      icon: 'https://placekitten.com/300/300',
    },
    // attestation: 'direct', // no need for most case
    // timeout: 90000,
    // authenticatorSelection: {
    //   authenticatorAttachment: 'cross-platform',
    //   userVerification: 'preferred',
    //   requireResidentKey: false,
    // },
    // excludeCredentials: [],
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RSA256 window hello supportt
    ],
  });
});

router.post('/', function (req, res) {
  // console.log(req.body);
  let {
    username,
    rawId,
    type,
    response, // { clientDataJSON, attestationObject }
  } = req.body;
  let clientDataJSON = JSON.parse(Buffer.from(response.clientDataJSON).toString());
  if (
    !Buffer.from(clientDataJSON.challenge, 'base64').equals(db[username].challenge) ||
    new URL(clientDataJSON.origin).hostname !== 'localhost' ||
    clientDataJSON.type !== 'webauthn.create'
  ) {
    res.sendStatus(405);
  }
  let attestationObject = parseAttestation2Object(response.attestationObject);
  // console.log(attestationObject);
  let { authData } = attestationObject;
  // also should check rpIdHash and UV,UP in the authData.flags
  let credential = {
    credID: Buffer.from(rawId).toString('base64'),
    counter: authData.counter,
    publicKeyPem: authData.publicKeyPem,
  };
  // console.log(Buffer.from(rawId).toString('base64'), credential.credID);
  db[username].publicKeys = [credential];
  db[username].isRegister = true;
  res.sendStatus(200);
});

export default router;
