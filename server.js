const router = require('./routes/index');
const express = require('express');
const app = express();
const port = process.env.PORT || '5000';

app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
