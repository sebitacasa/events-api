const nodemailer = require("nodemailer");
const { emailModel } = require("./emailModel");
const { MAILUSER, MAILPASS } = process.env;

async function sendEmail(userEmail, content) {
  
  // 1. Configuración (Outlook/Hotmail)
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", 
    port: 587,
    secure: false, 
    auth: {
      user: MAILUSER,
      pass: MAILPASS,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false
    }
  });

  // 2. 🔥 AQUÍ ES DONDE DEBEN IR LOS LOGS (Dentro de la función) 🔥
  console.log("📡 --- DEBUG EMAIL ---");
  console.log("HOST CONFIGURADO:", transporter.options.host); 
  console.log("PUERTO:", transporter.options.port);
  console.log("USUARIO:", transporter.options.auth.user);
  console.log("---------------------");

  // 3. Enviar el correo
  let info = await transporter.sendMail({
    from: `"UnderEvent App" <${MAILUSER}>`, 
    to: userEmail, 
    subject: `Notificación de tu compra UnderEventApp`, 
    text: "Compra UnderEventApp", 
    html: emailModel(content), 
  });

  console.log("✅ Correo enviado: %s", info.messageId);
}

module.exports = { sendEmail };