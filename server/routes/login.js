import express from 'express';
import crypto from 'crypto';
import db from '../db.js';
import pareseAuthenticatorData from '../utils/pareseAuthenticatorData.js';

const router = express.Router();

router.post('/challenge', function (req, res) {
  let { username } = req.body;
  if (!db[username] || !db[username].isRegister) {
    res.sendStatus(405);
    return;
  }
  db[username].challenge = crypto.randomBytes(32);
  res.send({
    challenge: db[username].challenge,
    // timeout: 90000,
    rpId: 'localhost',
    allowCredentials: db[username].publicKeys.map((keyObj) => ({
      type: 'public-key',
      id: Buffer.from(keyObj.credID, 'base64'),
      // transports: ['internal', 'usb', 'nfc', 'ble'],
    })),
    userVerification: 'preferred',
    // extensions: [],
  });
});

router.post('/', function (req, res) {
  // console.log(req.body);
  let {
    username,
    rawId,
    type,
    response, // { clientDataJSON, authenticatorData, signature, userHandle },
  } = req.body;
  let cerdID = Buffer.from(rawId).toString('base64');
  let publicKeyFromStore = db[username].publicKeys.find((keyObj) => keyObj.credID === cerdID);
  if (!publicKeyFromStore) {
    res.sendStatus(405);
    return;
  }
  let clientDataJSON = JSON.parse(Buffer.from(response.clientDataJSON).toString());
  if (
    !Buffer.from(clientDataJSON.challenge, 'base64').equals(db[username].challenge) ||
    new URL(clientDataJSON.origin).hostname !== 'localhost' ||
    clientDataJSON.type !== 'webauthn.get'
  ) {
    res.sendStatus(405);
    return;
  }
  let authenticatorData = pareseAuthenticatorData(response.authenticatorData);
  // console.log(authenticatorData);
  // also should check rpIdHash and UV,UP in the authData.flags
  // crypto.createHash('sha256').update('localhost').digest().equals(authenticatorData.rpIdHash);
  if (authenticatorData.counter < publicKeyFromStore.counter) {
    res.sendStatus(405);
    return;
  }
  // update publickey's couter(DB)
  publicKeyFromStore.counter = authenticatorData.counter;
  // verify signature
  let signData = Buffer.concat([
    response.authenticatorData,
    crypto.createHash('sha256').update(response.clientDataJSON).digest(),
  ]);
  let isApprove = crypto
    .createVerify('sha256')
    .update(signData)
    .verify(publicKeyFromStore.publicKeyPem, response.signature);
  if (isApprove) {
    res.sendStatus(200);
  } else {
    res.sendStatus(405);
  }
});
export default router;
