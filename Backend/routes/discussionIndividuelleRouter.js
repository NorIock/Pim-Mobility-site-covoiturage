const router = require('express').Router();
const auth = require("../middleware/auth");
const DiscussionIndividuelle = require("../models/discussionIndividuelleModel");
const Message = require("../models/discussionMessagesModel");
const Notification = require('../models/notification.model');
const Membre = require("../models/membreModel");

router.post("/creer/:id", auth, async function(req, res){
    try{
        // Validations
        if(!req.body.messageAccord){
            return res
                .status(400)
                .send({ msg: "Veuillez écrire votre message"})
        }

        // On va récupérer la notification par req.params par id afin de récupérer l'id des 2 membres
        const notification = await Notification.findById(req.params.id).populate("demandes_covoit_acceptees");

        let idMembre1 = notification.demandes_covoit_acceptees[0].demandeur_id;
        let idMembre2 = notification.demandes_covoit_acceptees[0].receveur_id;

        // Maintenant que l'on a les ids des membres, on vérifie qu'il n'existe pas déjà une conversation pour les 2
        const discussionExistante = await DiscussionIndividuelle.find({ $or: [
                                                        { $and: [ {participant1_id: idMembre1}, {participant2_id: idMembre2}]},
                                                        { $and: [ {participant1_id: idMembre2}, {participant2_id: idMembre1}]}
                                                                            ]});

        // On créé le message que l'on va intégrer à la conversation
        let nouveauMessage = new Message({
            prenom: notification.demandes_covoit_acceptees[0].receveur_prenom,
            prenom_id: notification.demandes_covoit_acceptees[0].receveur_id,
            texte: req.body.messageAccord,
        })
        await nouveauMessage.save()

        // Si elle n'existe pas, on crée la conversation
        if(discussionExistante.length === 0){
            let nouvelleDiscussionIndividuelle = new DiscussionIndividuelle({
                participant1_prenom: notification.demandes_covoit_acceptees[0].demandeur_prenom,
                participant1_id: notification.demandes_covoit_acceptees[0].demandeur_id,
                participant2_prenom: notification.demandes_covoit_acceptees[0].receveur_prenom,
                participant2_id: notification.demandes_covoit_acceptees[0].receveur_id,
                date_dernier_message: Date.now(),
                id_auteur_dernier_message: notification.demandes_covoit_acceptees[0].receveur_id,
                auteur_dernier_message: notification.demandes_covoit_acceptees[0].receveur_prenom,
                dernier_message: req.body.messageAccord,
            })
            nouvelleDiscussionIndividuelle.messages.push(nouveauMessage);
            await nouvelleDiscussionIndividuelle.save();
        }
        // Si elle existe, on ajoute le message:
        if(discussionExistante.length !== 0){
            // Impossible de modifier discussionExistante, on refait donc la recherche pour ajouter le message à la conversation
            let majDiscussion = await DiscussionIndividuelle.findOne({ $or: [
                                                { $and: [ {participant1_id: idMembre1}, {participant2_id: idMembre2}]},
                                                { $and: [ {participant1_id: idMembre2}, {participant2_id: idMembre1}]}
                                    ]});
            majDiscussion.date_dernier_message = Date.now();
            majDiscussion.id_auteur_dernier_message = notification.demandes_covoit_acceptees[0].receveur_id;
            majDiscussion.auteur_dernier_message = notification.demandes_covoit_acceptees[0].receveur_prenom;
            majDiscussion.dernier_message = req.body.messageAccord;
            majDiscussion.messages.push(nouveauMessage);
            await majDiscussion.save();
        }

        // On créé la notification pour que le membre sache qu'il a reçu un message
        let nouvelleNotification = new Notification({
            notification_pour: "Message",
            membre_notif_id: notification.demandes_covoit_acceptees[0].demandeur_id,
            membre_notif_prenom: notification.demandes_covoit_acceptees[0].demandeur_prenom,
            membre_notif_nom: notification.demandes_covoit_acceptees[0].demandeur_nom,
            message: nouveauMessage,
        })
        await nouvelleNotification.save();

        res.json(nouvelleNotification);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher toutes les conversations à partir de la navbar
router.get("/afficher-mes-discussions/:id", auth, async function(req, res){
    try{
        const mesConversations = await DiscussionIndividuelle.find({ $or: [ {participant1_id: req.params.id},
                                                                            {participant2_id: req.params.id } ] } )
                                                            .sort({date_dernier_message: -1})
                                                            .populate("messages");

        if(mesConversations.length === 0){
            res.json("Queud");
        } else {
            res.json(mesConversations);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher une conversation à partir de la liste de la navbar
router.get("/afficher-une-depuis-liste/:conversationId", auth, async function(req, res){
    try{
        const conversation = await DiscussionIndividuelle.findById(req.params.conversationId).populate("messages");

        res.json(conversation);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

// Permet d'écrire un message dans une conversation issue de la liste de la navbar
router.post("/message/depuis-navbar/:conversationId/:membreId", auth, async function(req, res){
    try{
        // Validations
        if(!req.body.texte){
            return res
                .status(400)
                .send({ msg: "Veuillez écrire un message"})
        }

        // On récupère le profil du membre qui écrit le message
        const membreQuiEcrit = await Membre.findById(req.params.membreId);

        // On créé le nouveau message:
        let nouveauMessage = new Message({
            prenom: membreQuiEcrit.prenom,
            prenom_id: req.params.membreId,
            texte: req.body.texte,
        });

        // A décommenter une fois les tests terminés
        await nouveauMessage.save();

        // On récupère la conversation pour y insérer le nouveau message
        const conversation = await DiscussionIndividuelle.findById(req.params.conversationId);

        conversation.messages.push(nouveauMessage);
        conversation.date_dernier_message = Date.now();
        conversation.id_auteur_dernier_message = req.params.membreId;
        conversation.auteur_dernier_message = membreQuiEcrit.prenom;
        conversation.dernier_message = req.body.texte;

        // A décommenter une fois les tests terminés
        await conversation.save();

        // On récupère les données de l'autre participant afin, de lui envoyer une notification pour le message qu'il reçoit
        if(conversation.participant1_id === req.params.membreId){
            // Si on met : autreParticipant = await Membre.findById(conversation.participant2_id); il y a une erreur pour 
            // autreParticipant (undifined) dans la nouvelleNotification
            autreParticipant = await Membre.findById(conversation.participant2_id);
        } else {
            autreParticipant = await Membre.findById(conversation.participant1_id);
        }

        // On créé la notification:
        let nouvelleNotification = new Notification({
            notification_pour: "Message",
            membre_notif_id: autreParticipant._id,
            membre_notif_prenom: autreParticipant.prenom,
            membre_notif_nom: autreParticipant.nom,
            message: nouveauMessage,
        });

        // A décommenter une fois les tests terminés
        await nouvelleNotification.save();

        res.json(nouvelleNotification);
        
    } catch(err){
        res.status(500).json({ error: err.message});
    }
})

// Permet d'afficher une conversation depuis le profil partiel
router.get("/afficher-une/depuis-profil-partiel/:membreId/:destinataireId", auth, async function(req, res){
    try{
        const afficherConversation = await DiscussionIndividuelle.findOne({ $or: [
                        { $and: [ {participant1_id: req.params.membreId}, {participant2_id: req.params.destinataireId}]},
                        { $and: [ {participant2_id: req.params.membreId}, {participant1_id: req.params.destinataireId}]},
                                                                            ]})
                                                                .populate("messages");

        res.json(afficherConversation);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// Permet d'envoyer un message depuis le profil partiel
router.post("/message/depuis-profil-partiel/:destinataireId/:membreId", auth, async function(req, res){
    try{
        // Validations
        if(!req.body.texte){
            return res
                .status(400)
                .send({ msg: "Veuillez écrire un message"});
        }

        // On va récupérer la conversation:
        const afficherConversation = await DiscussionIndividuelle.findOne({ $or: [
                { $and: [ {participant1_id: req.params.membreId}, {participant2_id: req.params.destinataireId}]},
                { $and: [ {participant2_id: req.params.membreId}, {participant1_id: req.params.destinataireId}]},
                                                                                 ]});

        // Comme on a besoin des prénoms dans les messages et pour la discussion (s'il faut la créer), on va les récupérer:
        const membreIdProfil = await Membre.findById(req.params.membreId);

        // On a aussi besoin des données du destinataire pour la notification:
        const destinataireIdProfil = await Membre.findById(req.params.destinataireId);

        // On enregistre le nouveau message
        let nouveauMessage = new Message({
            prenom: membreIdProfil.prenom,
            prenom_id: req.params.membreId,
            texte: req.body.texte,
        });
        
        await nouveauMessage.save();

        if(!afficherConversation){
            // S'il n'existe pas de conversation, il faut la créer
            
            let nouvelleConversation = new DiscussionIndividuelle({
                participant1_prenom: membreIdProfil.prenom,
                participant1_id: req.params.membreId,
                participant2_prenom: destinataireIdProfil.prenom,
                participant2_id: req.params.destinataireId,
                participant2_id: req.params.destinataireId,
            });
            nouvelleConversation.messages.push(nouveauMessage);
            nouvelleConversation.date_dernier_message = Date.now();
            nouvelleConversation.id_auteur_dernier_message = req.params.membreId;
            nouvelleConversation.auteur_dernier_message = membreIdProfil.prenom;
            nouvelleConversation.dernier_message = req.body.texte;

            await nouvelleConversation.save();
        }

        if(afficherConversation){
            // Si la conversation existe déjà:
            afficherConversation.messages.push(nouveauMessage);
            afficherConversation.date_dernier_message = Date.now();
            afficherConversation.id_auteur_dernier_message = req.params.membreId;
            afficherConversation.auteur_dernier_message = membreIdProfil.prenom;
            afficherConversation.dernier_message = req.body.texte;

            afficherConversation.save();
        }

        // On créé la notification:
        let nouvelleNotification = new Notification({
            notification_pour: "Message",
            membre_notif_id: req.params.destinataireId,
            membre_notif_prenom: destinataireIdProfil.prenom,
            membre_notif_nom: destinataireIdProfil.nom,
            message: nouveauMessage,
        });

        await nouvelleNotification.save();

        res.json(nouvelleNotification);
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;