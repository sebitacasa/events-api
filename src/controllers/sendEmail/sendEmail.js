const nodemailer = require("nodemailer");
const { emailModel } = require("./emailModel");
const { MAILUSER, MAILPASS } = process.env;

async function sendEmail(userEmail, content) {
  
  // Configuración Microsoft Moderna (Sin cifrados viejos)
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com", // Servidor oficial moderno
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: MAILUSER,
      pass: MAILPASS,
    },
    tls: {
      rejectUnauthorized: false
      // HEMOS QUITADO "ciphers: SSLv3" porque eso bloqueaba la conexión
    },
    family: 4, // Mantenemos IPv4 porque eso sí ayuda en Railway
  });

  console.log("📡 --- INTENTO DE ENVÍO (OFFICE365) ---");
  
  // Enviar el correo
  let info = await transporter.sendMail({
    from: `"UnderEvent App" <${MAILUSER}>`, 
    to: userEmail, 
    subject: `Notificación de tu compra UnderEventApp`, 
    text: "Compra UnderEventApp", 
    html: emailModel(content), 
  });

  console.log("✅ Correo enviado con éxito ID: %s", info.messageId);
}

module.exports = { sendEmail };