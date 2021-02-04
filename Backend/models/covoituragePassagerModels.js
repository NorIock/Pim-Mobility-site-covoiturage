const mongoose = require('mongoose');

const passagerSchema = new mongoose.Schema({

    passager_id: {
        type: String,
        required: true,
    },

    passager_prenom: {
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
module.exports = Passager = mongoose.model("Passager", passagerSchema);