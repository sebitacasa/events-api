const axios = require("axios");
const { Event, User, Order, Ticket } = require("../db");
const { Sequelize } = require("sequelize");
require('dotenv').config();


const postUser = async (req, res) => {
  try {
    console.log("🛬 req.body:", req.body);
    console.log("🔐 req.auth:", req.auth);

    const externalId = req.auth?.payload?.sub;
    console.log("external ID", externalId)

    if (!externalId) {
      return res.status(400).json({ error: "externalId not found in token" });
    }

    const { name, email, lastName, picture } = req.body;

    if (!name || !email || !lastName || !picture) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    let user = await User.findOne({ where: { externalId } });

    if (!user) {
      user = await User.create({
        externalId,
        name,
        lastName,
        email,
        picture,
      });
      console.log("👤 Usuario creado:", user);
    } else {
      console.log("👤 Usuario ya existente:", user);
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("🧨 postUser error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// const postUser = async (req, res) => {
//   const { name, email, lastName, picture } = req.body;
//   const externalId = req.auth.sub;
  
//   try {

//     let user = await User.findOne({ where: { externalId } });
    
//     if (!user) {
//       user = await User.create({
//         name,
//         lastName,
//         email,
//         picture,
//         externalId,
//       });
//     }
//     return res.json(user);
//   } catch (error) {
//     console.log(error);
//   }
// };

const getUser = async (req, res) => {
  const { externalId } = req.params;
  try {
    //buscar un usuario por externalId e incluir Order y Eventos
    const user = await User.findOne({
      where: {
        externalId: externalId,
      },
      include: [
        {
          model: Order,
          include: [
            {
              model: Ticket,
              include: [
                {
                  model: Event,
                  attributes: ["id", "title", "date", "city"],
                },
              ],
              attributes: ["id", "status"],
            },
          ],
          attributes: ["status", "date", "totalPrice"],
        },
      ],
      attributes: [
        "id",
        "name",
        "lastName",
        "email",
        "roll",
        "picture",
        "city",
        "province",
      ],
    });
    return res.json(user);

    // const user = await User.findOne(
    //   {
    //     where: {
    //       externalId,
    //     },
    //   },
    //   { include: [{ model: Order }, { model: Event }] }
    // );
    // return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (req, res) => {
  const { externalId } = req.params;
  const { name, email, roll, lastName, picture, city, province } = req.body;
  try {
    const userUpdated = await User.update(
      {
        name,
        email,
        roll,
        lastName,
        picture,
        city,
        province,
      },
      {
        where: {
          externalId,
        },
      }
    );
    const user = await User.findOne({
      where: {
        externalId,
      },
    });
    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

const banUser = async (req, res) => {
  const { externalId, block } = req.body;

  try {
    const tokenResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: process.env.AUTH0_AUDIENCE,
        grant_type: "client_credentials",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error("No se obtuvo el token de acceso");
      return res.status(500).json({ message: "Error al obtener el token de acceso" });
    }

    const userResponse = await axios.patch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${externalId}`,
      { blocked: block },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.status(200).json(userResponse.data);
  } catch (error) {
    if (error.response) {
      console.error("Error de respuesta:", error.response.data);
      return res.status(error.response.status).json(error.response.data);
    } else {
      console.error("Error desconocido:", error.message);
      return res.status(500).json({ message: "Error desconocido" });
    }
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json(users);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { postUser, getUser, updateUser, getAllUsers, banUser };
