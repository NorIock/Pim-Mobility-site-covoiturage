const mongoose = require('mongoose');

const faqParagrapheSchema = new mongoose.Schema({

    paragraphe: {
        type: String,
    },

    date_creation: {
        type: Date,
        default: Date.now,
    },

});

module.exports = FAQParagraphe = mongoose.model('FAQParagraphe', faqParagrapheSchema);
