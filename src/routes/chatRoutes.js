const { Router } = require("express")

const router = Router();
const { findUser, addChat, listChats } = require("../controllers/chatController");
const { isLoggedIn } = require("../middlewares/userMiddlewares");

router.route('/').get(isLoggedIn, findUser)
router.route('/add').post(isLoggedIn, addChat)
router.route('/list').get(isLoggedIn, listChats)

module.exports = router;