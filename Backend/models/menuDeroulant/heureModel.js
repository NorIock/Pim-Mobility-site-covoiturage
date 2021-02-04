const mongoose = require('mongoose');

const heureSchema = new mongoose.Schema({

    chiffre: {
        type: String,
        required: true,
    },
});

module.exports = Heure = mongoose.model("Heure", heureSchema);