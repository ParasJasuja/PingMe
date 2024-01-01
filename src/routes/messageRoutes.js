const { Router } = require("express")

const router = Router();
const { isLoggedIn } = require("../middlewares/userMiddlewares");
const { sendMessage, getMessages } = require("../controllers/messageController");

router.route('/')
    .get(isLoggedIn, getMessages)
    .post(isLoggedIn, sendMessage)


module.exports = router;