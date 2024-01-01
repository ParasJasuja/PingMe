const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide Name"],
    },
    photo: {
        url: {
            type: String,
            required: true,
            default: "https://picsum.photos/200/300"
        }
    },
    gender: {
        type: String,
        required: [true, "Please provide Gender"],
        enum: {
            values: ['male', 'female', 'other']
        }
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        select: false
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = 13;
    this.password = await bcrypt.hash(this.password, salt)
})

userSchema.method('getJwtToken', function () {
    return jwt.sign({
        id: this._id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP
    })
})

userSchema.method('verifyPassword', function (password, hash) {
    return bcrypt.compare(password, hash)
})

module.exports = mongoose.model("User", userSchema);