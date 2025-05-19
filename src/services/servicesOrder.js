const { Order, User, Ticket } = require("../db");
const { Op } = require("sequelize");

const createOrder = async (order) => {
  console.log("🧾 Email recibido en orderData:", order.email);
  const allUsers = await User.findAll();
  console.log("📋 Emails en DB:");
  allUsers.forEach(u => console.log("➡️", `"${u.email}"`));

  const email = order.email?.trim().toLowerCase();
  try {
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email, // búsqueda insensible a mayúsculas/minúsculas en Postgres
        },
      },
    });
    console.log("usuario encontroda sssssss", user.dataValues)
    if (!user) {
      console.error("❌ Usuario no registrado:", order.email);
      return null; // No crear la orden
    }

    const newOrder = await user.createOrder({
      userId: user.id,
    status: "Pending",
    date: new Date().toString(),
    quantity: order.quantity,
    totalPrice: order.totalPrice,
    });
    console.log("ordendes sddd", newOrder)

    for (var j = 0; j < order.eventos.length; j++) {
      for (var i = 0; i < order.eventos[j].cantidad; i++) {
        const encuentroTickets = await Ticket.findOne({
          where: {
            status: "Disponible",
            EventId: order.eventos[j].id,
          },
        });

        if (!encuentroTickets) {
          console.error(`❌ No hay ticket disponible para evento ID: ${order.eventos[j].id}`);
          continue; // o podrías hacer return si querés abortar todo
        } 
        
        await newOrder.addTickets(encuentroTickets);
        encuentroTickets.status = "Reservado";
        await encuentroTickets.save(); // aca actualizo el estado del ticket
      }
    }

    const orderRes = await Order.findByPk(newOrder.id, {
      include: [{ model: Ticket }, { model: User }],
    });
    console.log("orderRes Final", orderRes)

    return orderRes;
  } catch (error) {
    console.log(error);
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const order = await Order.findByPk(orderId);
    order.status = status;
    await order.save();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createOrder,
  updateOrderStatus,
};
