const { Router } = require("express");

const {
  putEvent,
  postEvent,
  getByTitle,
  getIdDb,
  getByState,
  solocitys,
  getEventsDb,
  soloGeneros,
  getEventsByDate,
  datesEvent,
  getTiketsDisponibles,
  eventClient
} = require("../controllers/controllersClients");


const { payment } = require("../controllers/Stripe");
const jwtCheck = require("../controllers/Stripe")

//nueva config de indice de rutas: las de arriba agregue una / al ultimo porfi

const router = Router();

router.get("/getTiketsDisponibles/:id/", getTiketsDisponibles);
router.get("/sologeneros/", soloGeneros);
router.get("/getAll/", getEventsDb);
router.get("/solocitys/", solocitys);
router.post("/createEvent/", postEvent);
router.get("/getTitle", getByTitle);
router.get("/getStates/", getByState);

router.get("/getDates/", datesEvent);
router.get("/eventclient/:id", eventClient);

// y las rutas de params agregar luego de esta linea en orden descendente de entradas (como esta ahora)
router.post("/create-payment-intent", jwtCheck.paymentIntent )
router.post("/payment", payment);

router.get("/getEvents/:date", getEventsByDate);
router.put("/putEvent/:id", putEvent);
router.get("/:id", getIdDb);




module.exports = router;
