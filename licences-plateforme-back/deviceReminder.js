// deviceReminder.js
const cron = require('node-cron');
const Mailgun = require('mailgun.js');
const FormData = require('form-data');
const Member = require("./member/member.js")
const Device = require("./device/device.js")
const config = require('./config/config.js');

const mg = new Mailgun(FormData).client({
  username: 'api',
  key: config.mailgun.API_KEY,
  // url: 'https://api.eu.mailgun.net' // if EU domain
});

function scheduleDeviceReminder() {
  cron.schedule(config.schedule, async () => {
    console.log("⏱️ Running Device Expiration Reminder...");
    try {
      const now = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

      // Fetch users
      const users = await Member.find({ notification: true }).select("username").populate("client");
      if (!users.length) return console.log("ℹ️ No users with notifications enabled.");

      const allDevices = await Device.find();
      const alertsByUser = new Map();
      users.forEach(user => alertsByUser.set(user.username, []));

      allDevices.forEach(device => {
        const end = device.endDate ? new Date(device.endDate) : null;
        if (!end) return;

        let status = null;
        if (end < now) status = "Expired";
        else if (end <= sixMonthsFromNow) status = "Soon to expire";
        else return;

        users.forEach(user => {
          alertsByUser.get(user.username).push({
            reference: device.reference,
            serialNumber: device.serialNumber,
            description: device.description,
            client: device.client?.nom || "N/A",
            endDate: end,
            status
          });
        });
      });

      // Send emails per user
      for (const [email, alerts] of alertsByUser.entries()) {
        if (!alerts.length) continue;

        const htmlTable = generateHtmlTable(alerts);

        const recipient = process.env.NODE_ENV === "production" ? email : "abdelmounim.metrane@gmail.com";

        try {
          const result = await mg.messages.create(config.mailgun.MAILGUN_DOMAIN, {
            from: config.mailgun.MAILGUN_FROM,
            to: [recipient],
            subject: "⚠️ Device Expiration Reminder",
            html: htmlTable
          });
          console.log(`📧 Reminder sent to ${recipient}:`, result.id);
        } catch (err) {
          console.error(`❌ Error sending to ${recipient}:`, err);
        }
      }

    } catch (err) {
      console.error("❌ Error in device expiration job:", err.message);
    }
  });
}

// Helper to generate HTML table
function generateHtmlTable(alerts) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    <h2 style="color: #d9534f;">⚠️ Device Expiration Alert</h2>
    <p style="font-size: 14px; color: #555;">
      The following devices are expired or will expire soon. Please take the necessary actions.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #007bff; color: #fff;">
          <th style="padding: 10px; text-align: left; border-radius: 4px 0 0 0;">Reference</th>
          <th style="padding: 10px; text-align: left;">S/N</th>
          <th style="padding: 10px; text-align: left;">Description</th>
          <th style="padding: 10px; text-align: left;">Client</th>
          <th style="padding: 10px; text-align: left;">Status</th>
          <th style="padding: 10px; text-align: left; border-radius: 0 4px 0 0;">Expiration</th>
        </tr>
      </thead>
      <tbody>
        ${alerts.map((d, i) => {
          const formattedDate = `${String(d.endDate.getDate()).padStart(2,'0')}/${String(d.endDate.getMonth()+1).padStart(2,'0')}/${d.endDate.getFullYear()}`;
          return `
            <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f1f1f1'};">
              <td style="padding: 10px;">${d.reference}</td>
              <td style="padding: 10px;">${d.serialNumber}</td>
              <td style="padding: 10px;">${d.description}</td>
              <td style="padding: 10px;">${d.client}</td>
              <td style="padding: 10px;">
                <span style="
                  display: inline-block;
                  padding: 3px 8px;
                  border-radius: 12px;
                  color: #fff;
                  font-size: 12px;
                  background-color: ${d.status === 'Expired' ? '#d9534f' : '#f0ad4e'};
                ">${d.status}</span>
              </td>
              <td style="padding: 10px;">${formattedDate}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    <p style="font-size: 12px; color: #999; margin-top: 20px;">
      This is an automated notification. Please do not reply to this email.
    </p>
  </div>
  `;
}

module.exports = { scheduleDeviceReminder };
