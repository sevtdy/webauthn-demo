import express from 'express';
import crypto from 'crypto';
import decodeReqCbor from './middlewares/decodeReqCbor.js';
import encodeRes2Cbor from './middlewares/encodeRes2Cbor.js';
import parseAttestation2Object from './utils/parseAttestation2Object.js';

const db = {
  example: {
    id: 'base64',
    username: 'example',
    isRegister: true,
    publicKeys: [
      {
        credId: 'base64',
        counter: 10,
        publicKeyPem: 'string',
      },
    ],
  },
};
const app = express();

app.use(express.raw({ type: 'application/cbor' }));
app.use(decodeReqCbor);
app.use(encodeRes2Cbor);

// app.get('/test', (req, res) => {
//   res.json({ aa: 'hahaha1234' });
// });

app.post('/challenge', function (req, res) {
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
      name: 'WebAuthen Demo',
      id: 'localhost',
    },
    user: {
      id: Buffer.from(db[username].id, 'base64'),
      name: username,
      displayName: 'displayname' + username,
      icon: 'https://placekitten.com/300/300',
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256
      { alg: -257, type: 'public-key' }, // RSA256
    ],
  });
});

app.post('/signup', function (req, res) {
  console.log(req.body);
  let clientDataJSON = JSON.parse(Buffer.from(req.body.response.clientDataJSON).toString());
  if (
    !Buffer.from(clientDataJSON.challenge, 'base64').equals(db[req.body.username].challenge) ||
    new URL(clientDataJSON.origin).hostname !== 'localhost' ||
    clientDataJSON.type !== 'webauthn.create'
  ) {
    res.sendStatus(405);
  }
  let attestationObject = parseAttestation2Object(req.body.response.attestationObject);
  // console.log(attestationObject);
  let credential = {
    credId: attestationObject.credId,
    counter: attestationObject.counter,
    publicKeyPem: attestationObject.publicKey,
  };
  // console.log(Buffer.from(req.body.rawId).toString('base64'), credential.credId);
  db[req.body.username].publicKeys = [credential];
  res.sendStatus(200);
});

const port = 3000;
app.listen(port);
console.log(`Started app on port ${port}`);
