const { MAILUSER, MAILPASS } = process.env;
const nodemailer = require("nodemailer");
const { emailModel } = require("./emailModel");



async function sendEmail(userEmail, content) {

  let transporter = nodemailer.createTransport({
    service: "smtp.gmail.com",
    port: 587,              // Usamos el puerto estándar de TLS
    secure: false,
    auth: {
     user: MAILUSER, // <--- CAMBIO AQUÍ (antes tenía el email escrito)
      pass: MAILPASS, // <--- CAMBIO AQUÍ (antes tenía la contraseña escrita)
    },
    tls: {
      rejectUnauthorized: false,
    },
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