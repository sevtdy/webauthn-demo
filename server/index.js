import express from 'express';
import decodeReqCbor from './middlewares/decodeReqCbor.js';
import encodeRes2Cbor from './middlewares/encodeRes2Cbor.js';
import signup from './routes/signup.js';

const app = express();

app.use(express.raw({ type: 'application/cbor' }));
app.use(decodeReqCbor);
app.use(encodeRes2Cbor);

app.use('/signup', signup);

// app.get('/test', (req, res) => {
//   res.json({ aa: 'hahaha1234' });
// });

const port = 3000;
app.listen(port);
console.log(`Started app on port ${port}`);
