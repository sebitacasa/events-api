const nodemailer = require("nodemailer");
const { emailModel } = require("./emailModel");
const { MAILUSER, MAILPASS } = process.env;

async function sendEmail(userEmail, content) {
  
  // Configuración BREVO (Puerto 2525 para evitar bloqueos de Railway)
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com", // Host oficial de Brevo
    port: 2525,                   // <--- ¡IMPORTANTE! Este puerto evita el Timeout
    secure: false,                
    auth: {
      user: MAILUSER,             // Tu email de login en Brevo (sebitacasa14@gmail.com)
      pass: MAILPASS,             // La clave SMTP que generaste (la larga)
    },
    tls: {
      rejectUnauthorized: false
    },
    family: 4, // Forzar IPv4 para mayor compatibilidad
  });

  console.log("📡 --- INTENTO DE ENVÍO (BREVO 2525) ---");
  
  // Enviar el correo
  let info = await transporter.sendMail({
    from: `"UnderEvent App" <${MAILUSER}>`, // Brevo requiere que el remitente coincida con tu usuario
    to: userEmail, 
    subject: `Notificación de tu compra UnderEventApp`, 
    text: "Compra UnderEventApp", 
    html: emailModel(content), 
  });

  console.log("✅ Correo enviado con éxito ID: %s", info.messageId);
}

module.exports = { sendEmail };