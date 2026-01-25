const axios = require("axios");
const { emailModel } = require("./emailModel");
const { MAILUSER, MAILPASS } = process.env; // MAILPASS ahora es tu API KEY (xkeysib...)

async function sendEmail(userEmail, content) {
  
  console.log("📡 --- INTENTO DE ENVÍO VÍA API (HTTP) ---");

  const url = "https://api.brevo.com/v3/smtp/email";
  
  const data = {
    sender: {
      name: "UnderEvent App",
      email: MAILUSER // Debe ser tu email verificado en Brevo
    },
    to: [
      {
        email: userEmail,
        name: "Cliente"
      }
    ],
    subject: "Notificación de tu compra UnderEventApp",
    htmlContent: emailModel(content)
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'accept': 'application/json',
        'api-key': MAILPASS, // Aquí va la clave xkeysib...
        'content-type': 'application/json'
      }
    });

    console.log("✅ Correo enviado con éxito (API). ID:", response.data.messageId);
    
  } catch (error) {
    console.error("❌ Error enviando correo vía API:");
    // Mostramos el error detallado que devuelve Brevo para saber qué pasa
    if (error.response) {
        console.error("Data:", error.response.data);
        console.error("Status:", error.response.status);
    } else {
        console.error(error.message);
    }
  }
}

module.exports = { sendEmail };