const mongoose = require('mongoose');

const conducteurPassagerSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
    },
});

module.exports = ConducteurPassager = mongoose.model("ConducteurPassager", conducteurPassagerSchema);