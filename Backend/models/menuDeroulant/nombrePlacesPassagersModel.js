const mongoose = require('mongoose');

const nombrePlacesPassagersSchema = new mongoose.Schema({

    nombre: {
        type: Number,
        required: true,
    },
});

module.exports = NombrePlacesPassagers = mongoose.model("NombrePlacesPassagers", nombrePlacesPassagersSchema);