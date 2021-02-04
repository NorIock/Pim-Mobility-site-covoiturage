const mongoose = require('mongoose');

const communeEntrepriseSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true,
    },
});

module.exports = CommuneEntreprise = mongoose.model("CommuneEntreprise", communeEntrepriseSchema);