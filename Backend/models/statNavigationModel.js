const mongoose = require("mongoose");

const statNavigationSchema = new mongoose.Schema({

    date: {
        type: Date,
        default: Date.now,
    },

    page: { // Sera soit matching aller, matching retour, train, bus, velo
        type: String,
    },

    fait_par_membreId: {
        type: String,
    },

    fait_par_membrePrenom: {
        type: String,
    },
});

module.exports = StatNavigation = mongoose.model("StatNavigation", statNavigationSchema);