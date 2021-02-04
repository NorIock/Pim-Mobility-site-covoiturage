const mongoose = require("mongoose");

const discussionAdministrateurSchema = new mongoose.Schema({

    membre_prenom: {
        type: String,
    },

    membre_id: {
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

module.exports = DiscussionAdministrateur = mongoose.model("DiscussionAdministrateur", discussionAdministrateurSchema);   