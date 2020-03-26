const express = require('express');
var app = express();

app.use('/user', require('./routes/user'));
app.use('/todo', require('./routes/todo'));

app.listen(5000, () => {
  console.log(`Listening to requests on http://localhost:5000`);
});
