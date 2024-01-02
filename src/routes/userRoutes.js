const { Router } = require("express");
const { userSignup, userLogin, userLogout } = require("../controllers/userController");
const { isLoggedIn } = require("../middlewares/userMiddlewares");
const router = Router();


router.route('/signup').post(userSignup)
router.route('/login').post(userLogin)
router.route('/logout').get(userLogout)


module.exports = router