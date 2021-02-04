const mongoose = require("mongoose");

const membreSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true,
    },

    prenom: {
        type: String,
        required: true,
    },

    email: {
        type: String, 
        required: true, 
        unique: true,
    },

    mot_de_passe: {
        type: String,
        required: true,
        minlength: 5,
    },

    telephone: {
        type: String,
        required: true,
    },

    date_inscription: {
        type: Date, 
        default: Date.now,
    },

    commune_entreprise: {
        type: String,
    },

    indisponible: {
        type: Boolean,
        default: false,
    },

    mode_paiement: {
        type: String,
    },

    role: {
        type: String,
    },

    admin: {
        type: Boolean,
        default: false,
    },

    banni: {
        type: Boolean,
        default: false,
    },

    // avis
    // passagers
    // conducteur

    trajets_aller: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrajetAller'}],

    trajets_retour: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrajetRetour'}],

    demandes_covoiturage: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DemandeCovoiturage'}],

});

module.exports = Membre = mongoose.model('Membre', membreSchema);