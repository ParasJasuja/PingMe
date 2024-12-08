const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    groupChat: {
        type: Boolean,
        required: true,
        default: false,
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
            },
            joinAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    admin: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return this.groupChat }
    }]
},
    { timestamps: true })


module.exports = mongoose.model("Chat", chatSchema);