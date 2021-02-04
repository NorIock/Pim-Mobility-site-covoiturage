const mongoose = require('mongoose');

const quartierSchema = new mongoose.Schema({

    nom_quartier: {
        type: String,
        required: true,
    },
});

module.exports = Quartier = mongoose.model("Quartier", quartierSchema);