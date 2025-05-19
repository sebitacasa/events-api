const { Router } = require("express");
const jwtCheck = require("../controllers/Stripe").jwtCheck;


// const { addCart } = require("../controllers/carrito/addCart");

const {
  postUser,
  getUser,
  updateUser,
  getAllUsers,
  banUser,
} = require("../controllers/controllersUser");

const {
  createOrder,
  getOrderById,
  getOrders,
  getAllOrders,
  deleteOrder,
  updateOrder,
} = require("../controllers/controllersOrder");
const logToken = require("../middlewares/logToken");


const {getAuthToken} = require("../middlewares/token")

const { addReview, getReviews, deleteReview } = require("../controllers/controllersReviews");

const router = Router();

router.get("/getReviews/:id/", getReviews);
router.delete("/deleteReview/:id", deleteReview);
router.post("/createReview/:id", addReview);
router.get("/getAllOrders", getAllOrders);
router.post("/newOrder", createOrder);
router.delete("/deleteOrder/:orderId", deleteOrder);
router.get("/getOrder/:orderId", getOrderById);
router.put("/updateOrder/:orderId", updateOrder);
router.get("/getOrders/:email", getOrders);

router.get("/:externalId", getUser);
router.put("/:externalId", updateUser);
router.get("/", getAllUsers);
router.post("/ban", banUser);

router.get("/debug-token", jwtCheck, (req, res) => {
  console.log("🔍 req.auth:", req.auth);
  res.json({ auth: req.auth });
});
router.post("/createUser",jwtCheck, logToken, postUser);

module.exports = router;
