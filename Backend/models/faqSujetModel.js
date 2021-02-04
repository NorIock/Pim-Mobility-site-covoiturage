const mongoose = require('mongoose');

const faqSujetSchema = new mongoose.Schema({

    sujet: {
        type: String,
    },

    date_creation: {
        type: Date,
        default: Date.now,
    },

    paragraphe : [{ type: mongoose.SchemaTypes.ObjectId, ref: "FAQParagraphe" }],

});

module.exports = FAQSujet = mongoose.model('FAQSujet', faqSujetSchema);
