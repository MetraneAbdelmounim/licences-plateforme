const { schedule } = require("node-cron");

module.exports = {

  HOST: process.env.HOST || '127.0.0.1',
  PORT: process.env.PORT || 5000,
  bdUrl : (process.env.NODE_ENV=="production")?"mongodb://mongo:27017/mppt":"mongodb://127.0.0.1:27017/mppt",
  secret_token_key:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  token_expiration :"590h",
  SOON_TO_EXPIRED : 6,
  PORT_PY:8000,
  HOST_PY: (process.env.NODE_ENV=="production")?"flask-service":"127.0.0.1",
  DATE_Licence : new Date('2026-09-01'),
  mailOptions : {
        from:  (process.env.NODE_ENV=="production")? 'test@axians.ma' : 'postmaster@sandbox3976616a1044434c8376786625419e21.mailgun.org'  ,
        to:  (process.env.NODE_ENV=="production")? []:'abdelmounim.metrane@gmail.com',
    },
  transporter:{
    host:(process.env.NODE_ENV=="production")? 'innovationmi8-com.mail.protection.outlook.com' : 'smtp.mailgun.org',
    port:(process.env.NODE_ENV=="production")? 25 : 587,
    auth:(process.env.NODE_ENV=="production")? null : {
        user: 'postmaster@sandbox3976616a1044434c8376786625419e21.mailgun.org',
        pass: 'Axians@2024'
    }  
  },
  mailgun:{
    MAILGUN_FROM : "Mailgun Sandbox <postmaster@sandbox3976616a1044434c8376786625419e21.mailgun.org>",
    MAILGUN_DOMAIN : "sandbox3976616a1044434c8376786625419e21.mailgun.org"

  },
  schedule:(process.env.NODE_ENV=="production")? '*/15 * * * *' : '*/1 * * * *',
  reload_midnight : false

}
