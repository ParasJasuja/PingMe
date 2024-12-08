const { default: mongoose } = require("mongoose")
const User = require("../models/userModel")
const CustomError = require("../util/CustomError")
const asyncHandler = require("../util/asyncHandler")
const { responseGenrator } = require("../util/structuredResponseGenrator")
const Chat = require("../models/chatModel")
const { emitSocketEvent } = require("../sockets/chat")
const chatEvents = require("../constants/chatEvents")

exports.findUser = asyncHandler(async (req, res, next) => {
    const { search } = req.query;
    if (!search) {
        return next(new CustomError(400, "Please provide search text"))
    }
    const users = await User.find({ email: { $regex: '^' + search }, _id: { $not: { $eq: req.user._id } } }).limit(5);
    return res.status(200).json(responseGenrator(users, `Found ${users.length} users`))
})

exports.addChat = asyncHandler(async (req, res, next) => {
    const { id } = req.body;
    if (!id) {
        return next(new CustomError(400, "Please provide id to connect"))
    }

    // Dont allow chat to yourself
    if (id == req.user._id) {
        return next(new CustomError(400, "Can not add yoursef"))
    }

    const user = await User.findById(id, "_id name");
    if (!user) {
        return next(new CustomError(400, "User does not exist."))
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

    emitSocketEvent(req, id, chatEvents.CHAT_ADD, responseGenrator(chat, "Chat Added"))

    return res.status(200).json(responseGenrator(chat, "Chat added successfully"))
})

exports.createGroupChat = asyncHandler(async (req, res, next) => {
    const { users, name } = req.body;

    if (!name) {
        return next(new CustomError(400, "Please provide name"));
    }
    if (users.length < 2) {
        return next(new CustomError(400, "Require at least 2 particepants to create group"))
    }

    const errors = [];
    const usersWithName = [];
    for (let i = 0; i < users.length; i++) {
        const id = users[i]
        const user = await User.findById(id, { _id: 1, name: 1 })
        if (!user) {
            errors.push(`User does not exist with id: ${id} `)
        } else if (req.user._id.toString() != id) {
            usersWithName.push({ userId: user._id, name: user.name })
        }
    }

    usersWithName.push({ userId: req.user._id, name: req.user.name })
    const chat = await Chat.create({
        groupChat: true,
        name,
        users: usersWithName,
        admin: [req.user._id]
    })

    chat.users.forEach(user => {
        const id = user.userId.toString()
        if (id != req.user._id.toString()) {
            emitSocketEvent(req, id, chatEvents.CHAT_ADD, responseGenrator(chat, `You are added to chat by ${req.user.name}`, errors))
        }
    })

    return res.status(200).json(responseGenrator(chat, "Group chat created successfully"))
})

exports.addParticepantsToGroupChat = asyncHandler(async (req, res, next) => {
    const { chatId, users } = req.body;
    if (!chatId || !users.length) {
        return next(new CustomError(400, "Please provide chatId and id of user to add"))
    }

    const chat = await Chat.findById(chatId, { "users.joinAt": 0, "users._id": 0 });

    if (!chat || !chat?.groupChat) {
        return next(new CustomError(400, "Invalid chatId"))
    }

    if (!chat?.admin?.includes(req.user._id)) {
        return next(new CustomError(401, "Only admin can add users"))
    }

    const errors = []
    const usersWithName = []
    for (let i = 0; i < users.length; i++) {
        const id = users[i]
        const user = await User.findById(id);
        console.log(chat.users.find(({ userId }) => { return userId.toString() == id }));
        if (!user) {
            errors.push(`User not found with id ${id}`)
        } else if (id != req.user._id && !chat.users.find(({ userId }) => { return userId.toString() == id })) {
            usersWithName.push({
                userId: user._id,
                name: user.name
            })
        }
    }

    if (!usersWithName.length) {
        return next(new CustomError(400, "Users already in chat"))
    }

    const updatedChat = await Chat.findByIdAndUpdate(chatId, {
        $push: { users: { $each: usersWithName } }
    }, { new: true })

    console.log(usersWithName);
    usersWithName.forEach((user) => {
        emitSocketEvent(req, (user.userId).toString(), chatEvents.CHAT_ADD, responseGenrator(updatedChat, `Added by ${req.user._id}`))
    })

    res.status(200).json(responseGenrator(updatedChat, "Particepants added successfully", errors))

})

// exports.removeParticepantFromGroupChat = asyncHandler(async (req, res, next) => {
//     const {chatId, userId} = req.body
//     if(!id || !chatId){
//         return next(new CustomError(400, "Please provide chatId and userId"))
//     }

//     const chatFound = await Chat.find({_id: chatId, "users.userId": userId});
//     if(!chatFound.length){
//         return next(new CustomError(400, "Invalid ChatId"))
//     }
//     const chat = chatFound[0]

//     if(userId == req.user._id.toString()){
//         if(!chat.admin.find(id => {return id.toString() == userId})){
//             const updatedChat= await Chat.updateOne({_id: chatId}, )
//         }
//         //TODO: Change logic to make someone else admin if admin leaves.
//         return next(new CustomError(400, "You are admin can not leave this chat"))
//     }
//     const user = await User.findById(userId)
//     if(!user){

//     }

// })

exports.listChatParticepants = asyncHandler(async (req, res, next) => {
    const chatId = req.params;
    if (!chatId) {
        return next(new CustomError(400, "Please provide chatId"))
    }
    const chatFound = await Chat.find({ _id: chatId, 'users.userId': res.user._id })
    if (!chatFound.length) {
        return next(new CustomError(400, "Invalid chatId"))
    }
    const chat = chatFound[0]


    res.status(200).json(responseGenrator({ users: chat.users, totalUsers: chat.users.length }, `${chat.users.length} users`))

})

exports.listChats = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const chats = await Chat.find({ "users.userId": user._id }).sort({ "lastMessage.time": -1 });
    //TODO: Add a name field for non group chat so that user can see name of other particepant.
    return res.status(200).json(responseGenrator(chats, `Found ${chats.length} chats`));
})