const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    groupChat: {
        type: Boolean,
        required: true,
        default: function () { return this.users.length != 2 },
    },
    name: {
        type: String,
        required: function () { return this.groupChat }
    },
    lastMessage: {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        time: {
            type: Date,
            default: Date.now
        }
    },
    users: [
        {
            name: {
                type: String,
                required: true
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        }
    ],
},
    { timestamps: true })


module.exports = mongoose.model("Chat", chatSchema);