const chatEvents = require("../../constants/chatEvents");
const Chat = require("../../models/chatModel");
const { errorResponseGenrator, responseGenrator } = require("../../util/structuredResponseGenrator");

const typingListener = (io, socket) => {
    socket.on(chatEvents.TYPING_EVENT, async ({ chatId }) => {
        const id = socket.user._id.toString();
        const chat = await Chat.findById(chatId);
        if (!chat) {
            io.to(id).emit(chatEvents.ERROR_EVENT, errorResponseGenrator("Invalid chat id", { error: "Invalid chatId: Provide a valid id" }))
        }

        chat.users.forEach(user => {
            const userId = user.userId.toString()
            if (userId != id) {
                io.to(userId).emit(chatEvents.TYPING_EVENT, responseGenrator({ id: socket.user._id, name: socket.user.name }, `${socket.user.name} is typing`))
            }
        });
    })
}


module.exports = typingListener