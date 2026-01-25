const nodemailer = require("nodemailer");
const { emailModel } = require("./emailModel");
const { MAILUSER, MAILPASS } = process.env;

async function sendEmail(userEmail, content) {
  
  // Configuración "Anti-Bloqueo" para Outlook en Railway
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false, // false para puerto 587
    auth: {
      user: MAILUSER,
      pass: MAILPASS,
    },
    tls: {
      ciphers: 'SSLv3', // Cifrado compatible
      rejectUnauthorized: false
    },
    // 🔥 ESTAS SON LAS LÍNEAS MÁGICAS 🔥
    family: 4,              // Obliga a usar IPv4 (Evita el bloqueo de IPv6)
    connectionTimeout: 10000, // Espera máx 10 seg
    greetingTimeout: 5000,    // Espera saludo del servidor máx 5 seg
    socketTimeout: 10000      // Si se cuelga, corta en 10 seg
  });

  console.log("📡 --- INTENTO DE ENVÍO ---");
  console.log("HOST:", transporter.options.host);
  console.log("MODO:", "IPv4 Forzado");

  // Enviar el correo
  let info = await transporter.sendMail({
    from: `"UnderEvent App" <${MAILUSER}>`, // El remitente DEBE ser tu email
    to: userEmail, 
    subject: `Notificación de tu compra UnderEventApp`, 
    text: "Compra UnderEventApp", 
    html: emailModel(content), 
  });

  console.log("✅ Correo enviado con éxito ID: %s", info.messageId);
}

module.exports = { sendEmail };