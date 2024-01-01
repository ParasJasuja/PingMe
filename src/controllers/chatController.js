const { default: mongoose } = require("mongoose")
const User = require("../models/userModel")
const CustomError = require("../util/CustomError")
const asyncHandler = require("../util/asyncHandler")
const { responseGenrator } = require("../util/structuredResponseGenrator")
const Chat = require("../models/chatModel")

exports.findUser = asyncHandler(async (req, res, next) => {
    const { search } = req.query;
    if (!search) {
        return next(new CustomError("400", "Please provide search text"))
    }
    const users = await User.find({ email: { $regex: '^' + search }, _id: { $not: { $eq: req.user._id } } }).limit(5);
    return res.status(200).json(responseGenrator(users, `Found ${users.length} users`))
})

exports.addChat = asyncHandler(async (req, res, next) => {
    const { id } = req.body;
    if (!id) {
        return next(new CustomError("400", "Please provide id to connect"))
    }

    // Dont allow chat to yourself
    if (id == req.user._id) {
        return next(new CustomError(400, "Can not add yoursef"))
    }

    const user = await User.findById(id, "_id name");
    if (!user) {
        return next(new CustomError("400", "User does not exist."))
    }
    const chatExist = await Chat.find({
        groupChat: false,
        "users.userId": { $all: [user._id, req.user._id] }
    })

    if (chatExist.length) {
        return res.status(200).json(responseGenrator(chatExist[0], "Chat already exists", { message: "Chat already exists. No need to create one." }))
    }

    const chat = await Chat.create({
        users: [{
            userId: user._id,
            name: user.name
        },
        {
            userId: req.user._id,
            name: req.user.name
        }
        ]
    })

    res.status(200).json(responseGenrator(chat, "Chat added successfully"))
})



exports.listChats = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const chats = await Chat.find({ "users.userId": user._id }).sort({ "lastMessage.time": -1 });
    //TODO: Add a name field so that user can see name of other particepant.
    res.status(200).json(responseGenrator(chats, `Found ${chats.length} chats`));
})