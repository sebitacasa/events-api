const { Router } = require("express");
const event = require("./clientRoutes");
const user = require("./userRoutes");
const { getAuthToken } = require("../middlewares/token");

const router = Router();

router.use("/events", event);
router.use("/users", user);

module.exports = router;
