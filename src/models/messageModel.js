const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reply: {
        type: Boolean,
        required: true,
        default: false
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: function () { return this.reply }
    },
    edited: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Message", messageSchema);