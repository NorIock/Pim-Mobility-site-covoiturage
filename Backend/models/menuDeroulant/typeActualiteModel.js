const mongoose = require('mongoose');

const typeActualiteSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true,
    },
});

module.exports = TypeActualite = mongoose.model("TypeActualite", typeActualiteSchema);