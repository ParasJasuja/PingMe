const { Router } = require("express");
const router = Router();

const { home } = require("../controllers/homeController");

router.route("/").get(home);

module.exports = router