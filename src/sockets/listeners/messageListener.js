const chatEvents = require("../../constants/chatEvents")
const Chat = require("../../models/chatModel")
const Message = require("../../models/messageModel")
const { errorResponseGenrator, responseGenrator } = require("../../util/structuredResponseGenrator")

const messageListener = (io, socket) => {
    socket.on(chatEvents.MESSAGE_EVENT, async ({ chatId, message, replyTo }) => {
        const id = (socket.user)._id.toString()
        const chatFound = await Chat.find({ _id: chatId, "users.userId": id });
        if (!(chatFound.length)) {
            return io.in(id).emit(chatEvents.ERROR_EVENT, errorResponseGenrator("Invalid ChatId", { error: "Invalid ChatID: You are not part of this chat" }))
        }
        const chat = chatFound[0];
        const newMessage = await Message.create({
            chatId, message, from: id
        })

        await Chat.findOneAndUpdate({ _id: chat._id }, {
            $set: {
                lastMessage: {
                    messageId: newMessage._id,
                    time: newMessage.createdAt
                }
            }
        })

        chat.users.forEach(user => {
            if (user.userId.toString() != id) {
                return io.in(user.userId.toString()).emit(chatEvents.MESSAGE_EVENT, responseGenrator(newMessage, "Message"))
            }
        })
    })
}

module.exports = messageListener