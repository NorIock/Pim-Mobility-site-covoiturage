const mongoose = require('mongoose');

const departSchema = new mongoose.Schema({

    nom: {
        type: String,
        required: true,
    },

    quartiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quartier'}],
});

module.exports = Depart = mongoose.model("Depart", departSchema);