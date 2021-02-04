const mongoose = require('mongoose');

const modePaiementSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
    },
});

module.exports = ModePaiement = mongoose.model("ModePaiement", modePaiementSchema);