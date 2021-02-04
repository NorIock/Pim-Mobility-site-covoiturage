const router = require('express').Router();
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');
const DiscussionAdministrateur = require('../models/discussionAdministrateurModel');
const DiscussionMessage = require('../models/discussionMessagesModel');
const Membre = require('../models/membreModel');
const AdminNotification = require('../models/notificationAdminModel ');

// Permet de créer une discussion avec un administrateur
router.post("/ecrire/message/:membreId", auth, async function(req, res){
    try{
        // Validation
        if(!req.body.texte){
            return res
                .status(400)
                .send({ msg: "Veuillez écrire un message"});
        }

        // On récupère les données du membre
        const membreQuiEnvoieMessage = await Membre.findById(req.params.membreId);

        // On créé le nouveau message que l'on va insérer dans la conversation
        let nouveauMessage = new DiscussionMessage({
            prenom: membreQuiEnvoieMessage.prenom,
            prenom_id: membreQuiEnvoieMessage._id,
            texte: req.body.texte,
        });

        await nouveauMessage.save();

        // On regarde s'il n'existe pas déjà une discussion du membre avec un administrateur
        const discussionExiste = await DiscussionAdministrateur.findOne({ membre_id: req.params.membreId });

        if(!discussionExiste){
            // Il n'y a pas de conversation, on va donc en créer une
            var nouvelleConversationAvecAdmin = new DiscussionAdministrateur({
                membre_prenom: membreQuiEnvoieMessage.prenom,
                membre_id: membreQuiEnvoieMessage._id,
                date_dernier_message: Date.now(),
                auteur_dernier_message: membreQuiEnvoieMessage.prenom,
                id_auteur_dernier_message: membreQuiEnvoieMessage._id,
                dernier_message: req.body.texte,
            });

            nouvelleConversationAvecAdmin.messages.push(nouveauMessage);
            await nouvelleConversationAvecAdmin.save();

        } else {
            discussionExiste.date_dernier_message = Date.now();
            discussionExiste.auteur_dernier_message = membreQuiEnvoieMessage.prenom;
            discussionExiste.id_auteur_dernier_message = membreQuiEnvoieMessage._id;
            discussionExiste.dernier_message = req.body.texte;
            discussionExiste.messages.push(nouveauMessage);

            await discussionExiste.save();
        }

        let adminNotif = new AdminNotification({
            message: nouveauMessage,
        });

        await adminNotif.save();
        res.json(adminNotif);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher-une/:membreId", auth, async function(req, res){
    try{

        const conversationAvecAdmin = await DiscussionAdministrateur.findOne({ membre_id: req.params.membreId })
                                                                    .populate("messages");


        if(!conversationAvecAdmin){
            res.json("Queud")
        } else {
            res.json(conversationAvecAdmin);
        }


    } catch(err){
        res.status(500).json({ error: err.message });
    }
})


module.exports = router;