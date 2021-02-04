const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    date_demande: {
        type: Date,
        default: Date.now,
    },

    // Permet de savoir de quel type de notification il s'agit, parmi les choix il y a:
    // Demande covoiturage, Accord demande covoiturage, Refus demande covoiturage, Message, Quitter un covoiturage,
    // Sorti d'un covoiturage
    notification_pour: {
        type: String,
    },

    membre_notif_id: {
        type: String,
        required: true,
    },

    membre_notif_prenom: {
        type: String,
        required: true,
    },

    membre_notif_nom: {
        type: String,
        // required: true,
    },

    notification_vue: {
        type: Boolean,
        default: false,
    },

    date_vue: {
        type: Date,
    },

    notification_ouverte: {
        type: Boolean,
        default: false,
    },

    date_ouverte: {
        type: Date,
    },

    demandes_covoit: [{ type: mongoose.Schema.Types.ObjectId, ref: "DemandeCovoiturage"}],

    demandes_covoit_refusees: [{ type: mongoose.Schema.Types.ObjectId, ref: "DemandeCovoiturage"}],

    demandes_covoit_acceptees: [{ type: mongoose.Schema.Types.ObjectId, ref: "DemandeCovoiturage"}],

    demandes_covoit_annulees: [{ type: mongoose.Schema.Types.ObjectId, ref: "DemandeCovoiturage"}],

    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message"},

    trajets_aller_quitte: [{ type: mongoose.Schema.Types.ObjectId, ref: "TrajetAller"}],

    trajets_retour_quitte: [{ type: mongoose.Schema.Types.ObjectId, ref: "TrajetRetour"}],

    passager_qui_quitte_prenom: {
        type: String,
    },

    passager_qui_quitte_id: {
        type: String,
    },

    conducteur_qui_fait_sortir_prenom: {
        type: String,
    },

    conducteur_qui_fait_sortir_id: {
        type: String,
    },

})

module.exports = Notification = mongoose.model('Notification', notificationSchema);