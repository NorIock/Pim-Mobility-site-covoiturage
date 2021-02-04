const mongoose = require("mongoose");

const covoiturageDemandeSchema = new mongoose.Schema({

    aller_ou_retour: { // Permet de savoir si la demande a été faite pour un aller ou un retour
        type: String,
        required: true,
    },

    passager_ou_conducteur: { // Au cas ou un profil au rôle hybride fait une demande à un autre membre qui a le même rôle. Dans sa demande, il indiquera s'il souhaite être conducteur ou passager
        type: String,
    },
    
    demandeur_id: { // Id de la personne qui fait une proposition pour du covoiturage
        type: String,
        required: true,
    },

    demandeur_nom: {
        type: String,
        required: true,
    },

    demandeur_prenom: {
        type: String,
        required: true,
    },

    receveur_id: { // Id de la personne qui reçoit la demande de covoiturage
        type: String,
        required: true,
    },

    receveur_nom: {
        type: String,
        required: true,
    },

    receveur_prenom: {
        type: String,
        required: true,
    },

    trajet_id: { // Id du trajet pour laquelle la demande est faite
        type: String,
        required: true,
    },

    date_demande: {
        type: Date,
        default: Date.now,
    },

    acceptee: { // Le champ sera complété si le receveur accepte (true) ou refuse (false) la demande
        type: Boolean,
    },

    validee: { // Passera en true si acceptée ou refusée. Permettra d'afficher plus facilement les demandes en cours
        type: Boolean,
        default: false,
    },

    annulee: { // On passe en true si la demande est annulée par le demandeur
        type: Boolean,
        default: false,
    },

    date_annulation: {
        type: Date,
    },

    date_accord_ou_refus: {
        type: Date,
    },

    motif_refus: {
        type: String,
    },

    trajets_aller: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrajetAller'}],

    trajets_retour: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrajetRetour'}],

    membres : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Membre'}],

    notification: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification'},
});
module.exports = DemandeCovoiturage = mongoose.model("DemandeCovoiturage", covoiturageDemandeSchema);