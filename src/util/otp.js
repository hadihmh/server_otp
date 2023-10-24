const crypto = require("crypto");
const {DynaEmailSender} = require ("dyna-email-sender");


const generateOTP = () => {
  return crypto.randomBytes(3).toString("hex");
};

const sendOTP = async (email, OTP) => {
  const sender = new DynaEmailSender({
    host: 'smtp.gmail.com',
    port: 587,
    ssl: true,
    username: process.env.EMAIL_SERVICE_USER,
    password: process.env.EMAIL_SERVICE_PASS,
    allowInvalidCertificates: true,
  });
  await sender.send({
    fromTitle: 'OTP Code For Registration',       
    fromAddress: 'hmhnexus5x@gamil.com',    
    toAddress: 'hadi.mahmudi74@gmail.com',             // or array of addresses
    subject: 'Hello ✔', 
    text: 'Hello world?',
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 3 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
      <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>Your Brand Inc</p>
        <p>1600 Amphitheatre Parkway</p>
        <p>California</p>
      </div>
    </div>
  </div>`,
  });

};

module.exports = { generateOTP, sendOTP };
