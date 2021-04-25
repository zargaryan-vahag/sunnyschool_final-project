const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const io = require('./socket');

const responseHandler = require('./middlewares/response-handler.js');
const router = require('./router');
const app = express();

global.onlineUsers = new Map();
global.__homedir = __dirname;
dotenv.config();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded());
app.use(responseHandler);

router(app);

mongoose.connect('mongodb://localhost/sunnyschool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  const server = http.createServer(app);
  server.listen(process.env.port);
  io(server);

  console.log('listening on port*:' + process.env.port);
});
