const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('مرحباً بك في تطبيقي على Vercel!');
});

module.exports = app;
