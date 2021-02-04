const mongoose = require('mongoose');

const minutreSchema = new mongoose.Schema({

    chiffre: {
        type: String,
        required: true,
    },
});

module.exports = Minute = mongoose.model("Minute", minutreSchema);