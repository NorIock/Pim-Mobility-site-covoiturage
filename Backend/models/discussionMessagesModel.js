const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({

    prenom: {
        type: String,
    },

    prenom_id: {
        type: String,
    },

    texte: {
        type: String,
    },

    date: {
        type: Date,
        default: Date.now,
    },
})

module.exports = Message = mongoose.model("Message", messageSchema);