if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
const cron = require('node-cron');
const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const axios = require('axios');
const express = require('express');
const config = require('./config/config.js');
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload');
const logger = require('morgan');
const cors = require('cors');
const ping = require('ping');
const mongoose = require('mongoose');
const authRoute = require('./auth/authRoute');
const deviceRoute = require('./device/deviceRoute.js');
const memberRoute = require('./member/memberRoute');
const clientRoute = require('./client/clientRoute.js')
const path = require('path');
const PORT = config.PORT;
const HOST = config.HOST;
const app = express();
const connectionUrl = config.bdUrl;
const { log } = require('console');
const Member = require("./member/member.js")
const Device = require("./device/device.js")
const Client = require("./client/client.js")
const { scheduleDeviceReminder } = require('./deviceReminder.js'); // adjust path

mongoose.connect(connectionUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
  useCreateIndex: true,
}).then(() => {
  console.log("Connected to the database");
}).catch((e) => {
  console.log(e);
  console.log("Connection failed!");
});

app.use(bodyparser.json({ limit: '500mb' }));
app.use(bodyparser.urlencoded({ limit: '500mb', extended: true }));
app.use(cors());
app.use(logger('dev'));

app.use('/uploads', express.static('uploads'));
app.use('/', express.static(path.join(__dirname, 'public/browser')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/browser', 'index.html'));
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization,multipart/form-data"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});
app.options('/api/*', function (request, response, next) {
  response.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  response.send();
});
// ----- MAILGUN SETUP -----

// ----- DEVICE EXPIRATION CRON -----
scheduleDeviceReminder()


app.use('/api/auth', authRoute);
app.use('/api/devices', deviceRoute);
app.use('/api/members', memberRoute);
app.use('/api/clients', clientRoute);

app.listen(PORT, () => {
  console.log(`server running at http://${HOST}:${PORT}`);
});
