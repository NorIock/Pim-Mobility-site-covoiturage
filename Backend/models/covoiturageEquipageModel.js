const mongoose = require("mongoose");

const equipageSchema = new mongoose.Schema({

    creation: {
        type: Date,
    },

    aller_ou_retour: { // Permet de faciliter le tri lors des requêtes
        type: String,
        required: true,
    },

    jour_trajet: { // Permet de faciliter le tri lors des requêtes
        type: String,
        required: true,
    },

    // Relation one to one, un seul conducteur par trajet
    conducteur: { type: mongoose.Schema.Types.ObjectId, ref: 'Membre' },

    // Relation one to many, plusieurs passagers dans un équipage
    passagers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Membre' }],

    // Relation one to one: un équipage par trajet
    trajet_aller: { type: mongoose.Schema.Types.ObjectId, ref: 'TrajetAller'},

    // Relation one to one: un équipage par trajet
    trajet_retour: { type: mongoose.Schema.Types.ObjectId, ref: 'TrajetRetour'},

});
module.exports = Equipage = mongoose.model("Equipage", equipageSchema);