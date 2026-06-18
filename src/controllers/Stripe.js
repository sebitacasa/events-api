const Stripe = require("stripe");
const stripe = Stripe(process.env.SECRET_KEY);
const { User } = require("../db");
const { sendEmail } = require("./sendEmail/sendEmail");
const { createOrder, updateOrderStatus } = require("../services/servicesOrder");
const {
  findTicketsByOrderId,
  updateTicketsStatusByOrderId,
} = require("../services/servicesTickets");
const { auth } = require("express-oauth2-jwt-bearer");
const { Op } = require("sequelize");

const mailSucces = {
  title: "Your Purchase Is Confirmed!",
  buttonLink: "https://under-event-client.vercel.app/",
  buttonText: "Explore More Events",
  noteMessage: "Keep your tickets safe — they are for your personal use only and are non-transferable.",
};

const mailFail = {
  title: "Payment Declined",
  message: "Something went wrong with your payment. Please try again.",
  buttonLink: "https://under-event-client.vercel.app/",
  buttonText: "Try Again",
  noteMessage: "You can retry the purchase anytime from your shopping cart.",
};

const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});


 
  const paymentIntent = async (req, res) => {
    const { amount } = req.body;
  
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Monto inválido" });
    }
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe trabaja en centavos
        currency: "usd",      // O "usd", según tu caso
        automatic_payment_methods: {
          enabled: true,
        },
      });
  
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Stripe error:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
  



  const payment = async (req, res) => {
    console.log("📦 req.body:", req.body);
   
    let status = "Failure";
    let error = null;
    const { amount, orderData, clientSecret } = req.body;
    
    let order
    try {
      order = await createOrder(orderData);
      if (!order || !order.id) {
        return res.status(401).json({ error: "Usuario no registrado o orden inválida" });
      }
      // ✅ 1. Crear la orden (solo una vez)
      
  
      console.log("orden creada:", order.id);
      const orderId = order.id;
  
      // ✅ 2. Confirmar el pago
      const paymentIntentId = clientSecret.split("_secret")[0]; // Extraer el ID
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        throw new Error("El pago no fue confirmado aún");
      }
  
      // ✅ 3. Actualizar estado
      await updateOrderStatus(orderId, "Approved");
      await updateTicketsStatusByOrderId("Vendido", orderId);
      const tickets = await findTicketsByOrderId(orderId);
      const user = await User.findByPk(order.userId); // <- usa el correcto
      const email = user.email;
  

    // 4. Generar HTML de tickets
    const htmlTickets = tickets.map((e) => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="max-width:520px; margin:16px auto 24px; border:2px solid #f0ad4e; border-radius:8px; overflow:hidden; font-family:Arial,Helvetica,sans-serif; background:#ffffff;">
        <tbody>
          <!-- Ticket header bar -->
          <tr>
            <td colspan="3" style="background-color:#1a1a2e; padding:10px 20px; text-align:center;">
              <span style="font-family:Arial,sans-serif; font-size:12px; font-weight:700; color:#f0ad4e; letter-spacing:4px; text-transform:uppercase;">
                UNDER EVENT APP
              </span>
            </td>
          </tr>
          <!-- Ticket body -->
          <tr>
            <!-- Left column: amber + event image -->
            <td width="25%" valign="top" style="background-color:#f0ad4e; padding:14px 10px; text-align:center;">
              <img src="${e.Event.dataValues.imagen}" width="110"
                style="width:110px; max-width:100%; height:auto; display:block; margin:0 auto; border-radius:4px; border:2px solid #fff;"
                alt="Event">
              <p style="margin:10px 0 0; color:#ffffff; font-size:11px; font-weight:700; text-align:center; line-height:1.4; letter-spacing:1px; text-transform:uppercase;">
                UNDER<br>EVENT
              </p>
            </td>
            <!-- Center column: event details -->
            <td width="50%" valign="top" style="padding:16px 18px; border-left:2px dashed #f0ad4e; border-right:2px dashed #f0ad4e;">
              <h2 style="margin:0 0 14px; color:#1a1a2e; font-size:15px; font-weight:700; line-height:1.3; font-family:Arial,Helvetica,sans-serif;">
                ${e.Event.dataValues.title}
              </h2>
              <p style="margin:0 0 3px; font-size:9px; color:#f0ad4e; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Location</p>
              <p style="margin:0 0 10px; font-size:12px; color:#555555; line-height:1.4;">${e.Event.dataValues.location}</p>
              <p style="margin:0 0 3px; font-size:9px; color:#f0ad4e; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Date</p>
              <p style="margin:0 0 10px; font-size:12px; color:#555555;">${e.Event.dataValues.date}</p>
              <p style="margin:0 0 3px; font-size:9px; color:#f0ad4e; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">Time</p>
              <p style="margin:0 0 12px; font-size:12px; color:#555555;">${e.Event.dataValues.time}</p>
              <div style="padding-top:10px; border-top:1px solid #eeeeee;">
                <p style="margin:0 0 2px; font-size:9px; color:#aaaaaa; text-transform:uppercase; letter-spacing:1px;">Ticket ID</p>
                <p style="margin:0; font-size:13px; color:#1a1a2e; font-weight:700; font-family:'Courier New',monospace;">#${e.dataValues.id}</p>
              </div>
            </td>
            <!-- Right column: QR code -->
            <td width="25%" valign="top" style="padding:14px 10px; text-align:center;">
              <img src="https://qrcode.tec-it.com/API/QRCode?data=${e.dataValues.id}"
                width="90" height="90"
                style="width:90px; height:90px; display:block; margin:0 auto; border:2px solid #f0ad4e; border-radius:4px;"
                alt="QR Code">
              <p style="margin:8px 0 0; font-size:9px; color:#999999; text-align:center; text-transform:uppercase; letter-spacing:0.5px;">Scan at entrance</p>
            </td>
          </tr>
          <!-- Ticket footer -->
          <tr>
            <td colspan="3" style="background-color:#fafafa; padding:8px 20px; border-top:1px solid #eeeeee; text-align:center;">
              <span style="font-size:10px; color:#aaaaaa; font-style:italic; font-family:Arial,sans-serif;">
                Non-transferable &middot; For personal use only
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    `).join("");

    // 5. Armar cuerpo del mail
    mailSucces.message = `
      <p style="font-size:16px; color:#555555; line-height:1.6; margin:0 0 20px 0; font-family:Arial,sans-serif;">
        Thank you for your purchase! Your tickets are confirmed and ready to use.
        Please save this email and present your tickets at the venue entrance.
      </p>
      ${htmlTickets}
    `;

    // 6. Enviar mail
    
   sendEmail(email, mailSucces).catch(err => {
        console.error("⚠️ El correo falló en segundo plano:", err.message);
    });

    status = "success";
    return res.json({ status });
  } catch (err) {
    console.error("Error en pago:", err.message);
    if (order?.id) {
      await updateOrderStatus(order.id, "Rejected");
      const user = await User.findByPk(order.UserId);
      const email = user?.dataValues?.email;
      await sendEmail(email, mailFail);
    }
    res.status(500).json({ status, error: err.message });
  }
};

module.exports = { payment, paymentIntent, jwtCheck };

