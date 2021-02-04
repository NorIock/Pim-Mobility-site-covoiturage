const mongoose = require('mongoose');

const motifRefusDemandeCovoiturageSchema = new mongoose.Schema({

    motif: {
        type: String,
        required: true,
    },
});

module.exports = MotifRefusDemandeDeCovoiturage = mongoose.model("MotifRefusDemandeDeCovoiturage", motifRefusDemandeCovoiturageSchema);