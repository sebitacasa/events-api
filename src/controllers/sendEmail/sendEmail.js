const nodemailer = require("nodemailer");
const { emailModel } = require("./emailModel");

const { MAILUSER, MAILPASS } = process.env;

async function sendEmail(userEmail, content) {

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // <--- ¡Asegúrate de que esta línea esté escrita así!
  port: 587,
  secure: false, // false para puerto 587
  auth: {
    user: process.env.MAILUSER,
    pass: process.env.MAILPASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4, // <--- ¡ESTA ES LA CLAVE! Fuerza a usar IPv4 en lugar de IPv6 (::1)
});

  let info = await transporter.sendMail({
    from: "blackwilson1495@gmail.com", // sender address
    to: userEmail, // list of receivers
    subject: `Notificacion de tu compra UnderEventApp`, // Subject line
    text: "Compra UnderEventApp", // plain text body
    html: emailModel(content), // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

module.exports = { sendEmail };