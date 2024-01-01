const chatEvents = require("../constants/chatEvents");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { emitSocketEvent } = require("../sockets/chat");
const CustomError = require("../util/CustomError");
const asyncHandler = require("../util/asyncHandler");
const { responseGenrator } = require("../util/structuredResponseGenrator");

exports.sendMessage = asyncHandler(async (req, res, next) => {
    const { chatId, message, replyTo } = req.body;
    //TODO: add reply to functionality
    if (!chatId) {
        next(new CustomError(400, "Please provide chatId and to id."))
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        next(new CustomError(400, "Chat not found with id " + chatId))
    }

    const newMessage = await Message.create({
        message,
        chatId,
        from: req.user._id
    })
    await Chat.findByIdAndUpdate(chatId, {
        $set: {
            lastMessage: {
                messageId: newMessage._id,
                time: Date.now()
            }
        }
    })

    chat.users.forEach((user) => {
        if (user.userId.toString() != req.user._id.toString()) {
            emitSocketEvent(req, user.userId.toString(), chatEvents.MESSAGE_EVENT, newMessage)
        }
    })
    res.status(200).json(responseGenrator(newMessage, "Message sent successfully"))
})

exports.getMessages = asyncHandler(async (req, res, next) => {
    //TODO: Implement get messages after a given date-time.
    const { messageId, chatId } = req.body;
    if (!chatId) {
        return next(new CustomError(401, "Please provide chatId"))
    }
    const chat = await Chat.findById(chatId);

    if (!chat) {
        return next(new CustomError(401, "Invalid Chat Id"))
    }

    if (!messageId) {
        const receivedMessages = await Message.find({ chatId }).sort({ updatedAt: -1, createdAt: -1 }).limit(10)
        return res.status(200).json(responseGenrator(receivedMessages, `Received ${receivedMessages.length} messages.`))
    }

    const message = await Message.findById(messageId);
    if (!message) {
        return next(new CustomError("Invalid Message Id"))
    }

    const receivedMessages = await Message.find({ chatId, updatedAt: { $gt: new Date(message.updatedAt) } }).sort({ updatedAt: -1, createdAt: -1 }).limit(20);

    return res.status(200).json(responseGenrator(receivedMessages, `Received ${receivedMessages.length} messages.`))
})