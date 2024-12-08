const { Router } = require("express")

const router = Router();
const { findUser, addChat, listChats, createGroupChat, addParticepantsToGroupChat, listChatParticepants } = require("../controllers/chatController");
const { isLoggedIn } = require("../middlewares/userMiddlewares");

router.route('/').get(isLoggedIn, findUser)
router.route('/add').post(isLoggedIn, addChat)
router.route('/list').get(isLoggedIn, listChats)
router.route('/group').post(isLoggedIn, createGroupChat)
router.route('/group/particepants/:chatId').get(isLoggedIn, listChatParticepants)
router.route('/group/particepants').post(isLoggedIn, addParticepantsToGroupChat)

module.exports = router;