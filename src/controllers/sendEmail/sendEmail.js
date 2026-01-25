const nodemailer = require("nodemailer");
const { emailModel } = require("./emailModel");
const { MAILUSER, MAILPASS } = process.env;

async function sendEmail(userEmail, content) {
  
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // Servidor de Microsoft
    port: 587,                     // Puerto estándar
    secure: false,                 // false para puerto 587
    auth: {
      user: MAILUSER,
      pass: MAILPASS,
    },
    tls: {
      ciphers: 'SSLv3',            // Ayuda a la compatibilidad
      rejectUnauthorized: false
    }
  });

  let info = await transporter.sendMail({
    from: `"UnderEvent App" <${MAILUSER}>`, 
    to: userEmail, 
    subject: `Notificación de tu compra UnderEventApp`, 
    text: "Compra UnderEventApp", 
    html: emailModel(content), 
  });

  console.log("✅ Correo enviado vía Outlook: %s", info.messageId);
}

module.exports = { sendEmail };