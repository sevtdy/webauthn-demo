import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.json({ aa: 'hahaha1234' });
});

const port = 3000;
app.listen(port);
console.log(`Started app on port ${port}`);
