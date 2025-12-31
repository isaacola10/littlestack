import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from LittleStack API');
});

export default app;
