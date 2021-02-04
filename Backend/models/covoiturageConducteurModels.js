const mongoose = require("mongoose");

const conducteurSchema = new mongoose.Schema({

    conducteur_id: {
        type: String,
        required: true,
    },

    conducteur_prenom: {
        type: String,
        required: true,
    },

    trajet: { // Aller ou retour
        type: String,
        required: true,
    },

    jour: { // Jour de la semaine pour lequel la personne est conducteur du membre
        type: String,
        required: true,
    },
});
module.exports = Conducteur = mongoose.model("Conducteur", conducteurSchema);