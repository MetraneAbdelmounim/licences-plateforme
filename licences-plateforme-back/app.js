if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}
const cron = require('node-cron');
const nodemailer = require('nodemailer');
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
const clientRoute=require('./client/clientRoute.js')
const path = require('path');
const PORT = config.PORT;
const HOST = config.HOST;
const app = express();
const connectionUrl = config.bdUrl;
const { log } = require('console');
const Member = require("./member/member.js")
const Device = require("./device/device.js")
const Client = require("./client/client.js")


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

const transporter = nodemailer.createTransport({
  host: config.transporter.host,
  port: config.transporter.port,
  auth: config.transporter.auth,
  tls: {
    rejectUnauthorized: false
  }
});
cron.schedule(config.schedule, async () => {
  console.log("⏱️ Running Device Expiration Reminder...");

  try {
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    // 1) Fetch users who want notifications
    const users = await Member.find({ notification: true })
      .select("username")
      .populate("client"); // each user has clients assigned

    
    if (!users.length) {
      console.log("ℹ️ No users with notifications enabled.");
      return;
    }

    // 2) Build map: email -> list of device alerts
    const alertsByUser = new Map();

    for (const user of users) {
      const email = `${user.username}`;

      // All clients assigned to user
    

      // Fetch devices of these clients
      const devices = await Device.find()

      
      for (const device of devices) {
        const end = device.endDate ? new Date(device.endDate) : null;

        if (!end) continue;

        let status = null;

        if (end < now) {
          status = "Expired";
        } else if (end <= sixMonthsFromNow) {
          status = "Soon to expire";
        } else {
          continue; // Ignore valid devices
        }

        if (!alertsByUser.has(email)) alertsByUser.set(email, []);

        alertsByUser.get(email).push({
          reference: device.reference,
          description: device.description,
          client: device.client?.nom || "N/A",
          endDate: end.toLocaleDateString(),
          status
        });
      }
    }

    // 3) Send emails if needed
    if (alertsByUser.size === 0) {
      console.log("✅ No expiring devices. No alerts sent.");
      return;
    }

    for (const [email, alerts] of alertsByUser.entries()) {
      // Build HTML table
      const htmlTable = `
        <h3>⚠️ Device Expiration Alert</h3>
        <p>The following devices are expired or will expire soon:</p>

        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Reference</th>
              <th>Description</th>
              <th>Client</th>
              <th>Status</th>
              <th>Expiration</th>
            </tr>
          </thead>
          <tbody>
            ${alerts
              .map(
                d => `
              <tr>
                <td>${d.reference}</td>
                <td>${d.description}</td>
                <td>${d.client}</td>
                <td>${d.status}</td>
                <td>${d.endDate}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;

      const mailOptions = {
        from: config.mailOptions.from,
        to: process.env.NODE_ENV === "production" ? email : "abdelmounim.metrane@gmail.com",
        subject: "⚠️ Device Expiration Reminder",
        html: htmlTable
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`❌ Error sending to ${email}:`, err);
        } else {
          console.log(`📧 Reminder sent to ${email}: ${info.response}`);
        }
      });
    }
  } catch (err) {
    console.error("❌ Error in device expiration job:", err.message);
  }
});


app.use('/api/auth', authRoute);
app.use('/api/devices', deviceRoute);
app.use('/api/members', memberRoute);
app.use('/api/clients', clientRoute);

app.listen(PORT, () => {
  console.log(`server running at http://${HOST}:${PORT}`);
});
