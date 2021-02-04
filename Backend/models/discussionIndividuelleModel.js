const mongoose = require("mongoose");

const discussionIndividuelleSchema = new mongoose.Schema({

    participant1_prenom: {
        type: String,
    },

    participant1_id: {
        type: String,
    },

    participant2_prenom: {
        type: String,
    },

    participant2_id: {
        type: String,
    },

    date_dernier_message: {
        type: String,
    },

    auteur_dernier_message:{
        type: String,
    },

    id_auteur_dernier_message:{
        type: String,
    },

    dernier_message:{
        type: String,
    },

    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],

})

module.exports = DiscussionIndividuelle = mongoose.model("DiscussionIndividuelle", discussionIndividuelleSchema);   