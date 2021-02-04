const mongoose = require("mongoose");

const actualiteSchema = new mongoose.Schema({

    date: {
        type: Date,
        default: Date.now,
    },

    type: { // Information, nouvelles fonctionnalitées, Alertes...
        type: String,
    },

    titre: {
        type: String,
    },

    contenu: {
        type: String,
    },

    visible: {
        type: Boolean,
        default: true,
    },
});

module.exports = Actualite = mongoose.model("Actualite", actualiteSchema);