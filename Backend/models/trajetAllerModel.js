const mongoose = require('mongoose');

const trajetAllerSchema = new mongoose.Schema({

    prenom: {
        type: String,
        required: true,
    },

    membre_id: {
        type: String,
        required: true,
    },

    jour: {
        type: String,
        required: true,
    },

    depart: {
        type: String, 
        required: true,
    },

    depart_quartier: {
        type: String,
    },

    heure_de_depart_en_string: { // Permet d'afficher plus facilement l'heure
        type:  String,
        required: true,
    },

    heure_depart_en_minutes: { // Permettra de réaliser plus facilement le matching (+/- 15 minutes)
        type: Number,
        required: true,
    },

    depart_heures: { // Pour récupérer plus facilement l'heure en valeur par défaut pour la modification du trajet
        type: String,
        required: true,
    },

    depart_minutes: { // Pour récupérer plus facilement l'heure en valeur par défaut pour la modification du trajet
        type: String,
        required: true,
    },

    destination: {
        type: String,
        required: true,
    },

    destination_quartier: {
        type: String,
    },

    nombre_de_places: {
        type: String,
        min: 0,
    },

    nombre_de_places_total: {
        type: String,
        min: 0,
    },

    // Au cas où le rôle du membre est passager et conducteur et qu'il accepte une demande de covoiturage pour laquelle il sera
    // passager, on passe ce champ à false pour qu'il n'apparaissent plus dans le matching ou qu'il ne puisse plus accepter une
    // demande de covoiturage tant qu'il est passager sur ce trajet
    passager_sur_autre_trajet: {
        type: Boolean,
        default: false,
    },

    // Pour faciliter le matching on rajoute ce champs pour que ceux ayant un rôle passager/conducteur ne soient pas matché s'ils
    // deviennent conducteur pour leur trajet
    conducteur_sur_ce_trajet: {
        type: Boolean,
        default: false,
    },

    demandes_covoiturage: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DemandeCovoiturage'}],

    // Il y a un seul équipage par trajet
    equipage: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipage'},
    
});
module.exports = TrajetAller = mongoose.model('TrajetAller', trajetAllerSchema);