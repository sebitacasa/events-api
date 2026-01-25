const nodemailer = require("nodemailer");
const { emailModel } = require("./emailModel");
const { MAILUSER, MAILPASS } = process.env;

async function sendEmail(userEmail, content) {
  
  // Configuración robusta para Railway + Gmail
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Volvemos al 465 que suele ser más estable en la nube si forzamos SSL
    secure: true, 
    auth: {
      user: MAILUSER,
      pass: MAILPASS,
    },
    tls: {
      rejectUnauthorized: false, // Ignorar errores de certificado
      ciphers: "SSLv3" // Forzar cifrado compatible
    },
    family: 4, // Forzar IPv4
    connectionTimeout: 10000, // Esperar máx 10 segundos, no 60
    greetingTimeout: 5000,
    socketTimeout: 10000 
  });

  // Usamos MAILUSER en el 'from' para que coincida con la autenticación
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