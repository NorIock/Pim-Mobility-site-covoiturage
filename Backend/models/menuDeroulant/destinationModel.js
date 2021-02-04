const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true,
    },

    quartiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quartier'}],
});

module.exports = Destination = mongoose.model("Destination", destinationSchema);