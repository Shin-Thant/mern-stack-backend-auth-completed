const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    roles: {
        User: {
            type: Number,
            default: 2001,
        },
        Editor: Number,
        Admin: Number,
    },
    password: {
        type: String,
        required: true,
    },
    // * we make refresh token field an array because we want out application able to be connected by many devices.
    refreshToken: [String],
});

module.exports = mongoose.model("User", userSchema);
