const router = require("express").Router(); // Execute la version Router()
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const Notifications = require("../models/notification.model"); // Permet d'utiliser le model notifications
const DiscussionIndividuelle = require("../models/discussionIndividuelleModel");
const Message = require('../models/discussionMessagesModel');

router.get("/afficher/:id", auth, async function(req, res){
    try{

        const afficherNotifications = await Notifications.find({ membre_notif_id: req.params.id }).populate("demandes_covoit")
                                                                                                   .populate("demandes_covoit_refusees")
                                                                                                   .populate("demandes_covoit_acceptees")
                                                                                                   .populate("message");

        // On parcourt toutes les notifications, si elle n'a jamais été chargée, notification_vue doit être à false. Quand
        // le back-end les charge, il vérifie si c'est false. Dans ce cas il passe à true pour dire qu'elle a été vue et indique
        // la date 
        for(notification of afficherNotifications){
            if(notification.notification_vue === false || !notification.date_vue){
                notification.notification_vue = true;
                notification.date_vue = Date.now();
            }
            await notification.save();
        }

        res.json(afficherNotifications);
        
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher-une/:id/:aller_ou_retour", auth, async function(req, res){
    try{

        // Si je fais la requete suivante: 
        // const afficherUneNotification = await Notifications.findById(req.params.id).populate("demandes_covoit")
        //                                                                             .populate({path: "demandes_covoit",
        //                                                                                         populate: "trajets_aller"})
        //                                                                             .populate({path: "demandes_covoit",
        //                                                                                         populate: "trajets_retour"});
        // Le populate ne fonctionne pas et rien ne s'affiche. Je dois donc couper en 2 et faire 2 requête selon qu'il s'agit d'un
        // aller ou un retour
        
        if(req.params.aller_ou_retour === "aller"){

            const afficherUneNotification = await Notifications.findById(req.params.id).populate("demandes_covoit")
                                                                                        .populate({path: "demandes_covoit",
                                                                                                    populate: "trajets_aller"});
            

            // A l'affichage de la notification, on vérifie si notification_ouverte est true ou false. Si c'est false, on la passe à
            // true et on enregistre la date à laquelle elle a été ouverte
            if(afficherUneNotification.notification_ouverte === false){
                afficherUneNotification.notification_ouverte = true;
                afficherUneNotification.date_ouverte = Date.now();
                await afficherUneNotification.save();
            }
            res.json(afficherUneNotification);
        }

        if(req.params.aller_ou_retour === "retour"){

            const afficherUneNotification = await Notifications.findById(req.params.id).populate("demandes_covoit")
                                                                                        .populate({path: "demandes_covoit",
                                                                                                    populate: "trajets_retour"});
            

            // A l'affichage de la notification, on vérifie si notification_ouverte est true ou false. Si c'est false, on la passe à
            // true et on enregistre la date à laquelle elle a été ouverte
            if(afficherUneNotification.notification_ouverte === false){
                afficherUneNotification.notification_ouverte = true;
                afficherUneNotification.date_ouverte = Date.now();
                await afficherUneNotification.save();
            }
            res.json(afficherUneNotification);
        }
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher le contenu d'une notification de refus de covoiturage
router.get("/refus/afficher-une/:id/:aller_ou_retour", auth, async function(req, res){
    try{

        if(req.params.aller_ou_retour === 'aller'){
            const afficherUneNotification = await Notifications.findById(req.params.id).populate("demandes_covoit_refusees")
                                                                                        .populate({path: "demandes_covoit_refusees",
                                                                                                    populate: "trajets_aller"});
            
            // A l'affichage de la notification, on vérifie si notification_ouverte est true ou false. Si c'est false, on la passe à
            // true et on enregistre la date à laquelle elle a été ouverte
            if(afficherUneNotification.notification_ouverte === false){
                afficherUneNotification.notification_ouverte = true;
                afficherUneNotification.date_ouverte = Date.now();
                await afficherUneNotification.save();
            }
            res.json(afficherUneNotification);
        }
        if(req.params.aller_ou_retour === "retour"){

            const afficherUneNotification = await Notifications.findById(req.params.id).populate("demandes_covoit_refusees")
                                                                                        .populate({path: "demandes_covoit_refusees",
                                                                                                    populate: "trajets_retour"});
            

            // A l'affichage de la notification, on vérifie si notification_ouverte est true ou false. Si c'est false, on la passe à
            // true et on enregistre la date à laquelle elle a été ouverte
            if(afficherUneNotification.notification_ouverte === false){
                afficherUneNotification.notification_ouverte = true;
                afficherUneNotification.date_ouverte = Date.now();
                await afficherUneNotification.save();
            }
            res.json(afficherUneNotification);
        }


    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher le contenu d'une notification d'accord de covoiturage
router.get("/accord/afficher-une/:id/:aller_ou_retour", auth, async function(req, res){
    try{

        if(req.params.aller_ou_retour === 'aller'){
            const afficherUneNotification = await Notifications.findById(req.params.id).populate("demandes_covoit_acceptees")
                                                                                        .populate({path: "demandes_covoit_acceptees",
                                                                                                    populate: "trajets_aller"});
            
            // A l'affichage de la notification, on vérifie si notification_ouverte est true ou false. Si c'est false, on la passe à
            // true et on enregistre la date à laquelle elle a été ouverte
            if(afficherUneNotification.notification_ouverte === false){
                afficherUneNotification.notification_ouverte = true;
                afficherUneNotification.date_ouverte = Date.now();
                await afficherUneNotification.save();
            }
            res.json(afficherUneNotification);
        }
        if(req.params.aller_ou_retour === "retour"){

            const afficherUneNotification = await Notifications.findById(req.params.id).populate("demandes_covoit_acceptees")
                                                                                        .populate({path: "demandes_covoit_acceptees",
                                                                                                    populate: "trajets_retour"});
            

            // A l'affichage de la notification, on vérifie si notification_ouverte est true ou false. Si c'est false, on la passe à
            // true et on enregistre la date à laquelle elle a été ouverte
            if(afficherUneNotification.notification_ouverte === false){
                afficherUneNotification.notification_ouverte = true;
                afficherUneNotification.date_ouverte = Date.now();
                await afficherUneNotification.save();
            }
            res.json(afficherUneNotification);
        }


    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher le message reçu suite à une notification
router.get("/message/afficher-un/:id", auth, async function(req, res){
    try{

        const afficherMessage = await Notifications.findById(req.params.id).populate("message");

        // A l'affichage de la notification, on vérifie si notification_ouverte est true ou false. Si c'est false, on la passe à
        // true et on enregistre la date à laquelle elle a été ouverte
        if(afficherMessage.notification_ouverte === false){
            afficherMessage.notification_ouverte = true,
            afficherMessage.date_ouverte = Date.now();
            await afficherMessage.save();
        }
        res.json(afficherMessage);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher la conversation grâce au message de la notification
router.get("/conversation-suite-message/:messageId", auth, async function(req, res){
    try{

        const afficherConversation = await DiscussionIndividuelle.find({ messages: req.params.messageId }).populate("messages");

        res.json(afficherConversation);

    } catch(err){
        res.status(500).json({ err: error.message });
    }
});

// Permet de répondre en affichant la conversation après une notification
router.post("/conversation-suite-message/repondre/:messageId/:membreId", auth, async function(req, res){
    try{

        if(req.body.texte.length === 0){
            return res
                .status(400)
                .send({ msg: "Veuillez écrire votre message"});
        }

        const recupererConversation = await DiscussionIndividuelle.findOne({ messages: req.params.messageId });
        
        if(req.params.membreId === recupererConversation.participant1_id){
            var membrePrenom = recupererConversation.participant1_prenom;
            // On récupère aussi les données de la personne qui reçoit le message pour la notification
            var receveurPrenom = recupererConversation.participant2_prenom;
            var receveurId = recupererConversation.participant2_id;
        }

        if(req.params.membreId === recupererConversation.participant2_id){
            var membrePrenom = recupererConversation.participant2_prenom;
            // On récupère aussi les données de la personne qui reçoit le message pour la notification
            var receveurPrenom = recupererConversation.participant1_prenom;
            var receveurId = recupererConversation.participant1_id;
        }

        let nouveauMessage = new Message({
            prenom: membrePrenom,
            prenom_id: req.params.membreId,
            texte: req.body.texte, 
        });
        await nouveauMessage.save();

        let nouvelleNotification = new Notifications({
            notification_pour: "Message",
            membre_notif_id: receveurId,
            membre_notif_prenom: receveurPrenom,
            message: nouveauMessage
        });

        await nouvelleNotification.save();
        
        recupererConversation.date_dernier_message = Date.now();
        recupererConversation.messages.push(nouveauMessage);
        await recupererConversation.save();

        res.json(recupererConversation);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher le ou les covoiturage(s) quitté(s)
router.get("/fin-covoiturage/:notificationId", auth, async function(req, res){
    try{

        const quitterCovoiturageNotification = await Notifications.findById(req.params.notificationId)
                                                                    .populate("trajets_aller_quitte")
                                                                    .populate("trajets_retour_quitte");

        // A l'affichage de la notification, on vérifie si notification_ouverte est true ou false. Si c'est false, on la passe à
        // true et on enregistre la date à laquelle elle a été ouverte
        if(quitterCovoiturageNotification.notification_ouverte === false){
            quitterCovoiturageNotification.notification_ouverte = true;
            quitterCovoiturageNotification.date_ouverte = Date.now();
            await quitterCovoiturageNotification.save();
        }

        res.json(quitterCovoiturageNotification);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
}) 


// Permet à l'admin d'afficher toutes les notifications
router.get("/admin/afficher", adminAuth, async function(req, res){
    try{

        const affichezLesToutes = await Notifications.find({ $and: [ { notification_pour: "Demande covoiturage" },
                                                                     { demandes_covoit: { $exists: true } } ] } )
                                                     .populate("demandes_covoit");
        
        // On filtre pour ne garder que les notifications qui ont demandes de covoiturages qui sont en cours
        const result = affichezLesToutes.filter(une => une.demandes_covoit.length !== 0)

        res.json(result);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});


// Permet à l'admin d'afficher toutes les notifications non vues par le membre qui les a reçues
router.get("/admin/afficher-non-vues", adminAuth, async function(req, res){
    try{

        const affichezLesNonVues = await Notifications.find( { $and: [ { notification_vue: false},
                                                                       { notification_pour: "Demande covoiturage"},
                                                                       { demandes_covoit: { $exists: true} } ] } )
                                                        .populate("demandes_covoit");
            
        // On filtre pour ne garder que les notifications qui ont demandes de covoiturages qui sont en cours
        const result = affichezLesNonVues.filter(une => une.demandes_covoit.length !== 0)
        res.json(result);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet à l'admin d'afficher toutes les notifications vues mais pas ouvertes par le membre qui les a reçues
router.get("/admin/afficher-vues", adminAuth, async function(req, res){
    try{

        const affichezLesVues = await Notifications.find( { $and: [ { notification_vue: true},
                                                                    { notification_ouverte: false },
                                                                    { notification_pour: "Demande covoiturage"},
                                                                    { demandes_covoit: { $exists: true} } ] } )
                                                    .populate("demandes_covoit");
        
        
        // On filtre pour ne garder que les notifications qui ont demandes de covoiturages qui sont en cours
        const result = affichezLesVues.filter(une => une.demandes_covoit.length !== 0)
        res.json(result);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet à l'admin d'afficher toutes les notifications ouvertes mais pas acceptées ou refusées par le membre qui les a reçues
router.get("/admin/afficher-ouvertes", adminAuth, async function(req, res){
    try{

        const affichezLesOuvertes = await Notifications.find( { $and: [ { notification_ouverte: true},
                                                                        { notification_pour: "Demande covoiturage"},
                                                                        { demandes_covoit: { $exists: true} } ] } )
                                                        .populate("demandes_covoit");
        
        // On filtre pour ne garder que les notifications qui ont demandes de covoiturages qui sont en cours
        const result = affichezLesOuvertes.filter(une => une.demandes_covoit.length !== 0)
        res.json(result);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet à l'admin d'afficher le détail d'une notification de demande de covoiturage
router.get("/admin/afficher-detail/:id/:allerOuRetour", adminAuth, async function(req, res){
    try{

        if(req.params.allerOuRetour === "aller"){
            const detailNotificationCovoiturageAller = await Notifications.findById(req.params.id)
                                                                          .populate("demandes_covoit")
                                                                          .populate({path: "demandes_covoit",
                                                                                     populate: "trajets_aller"})

            res.json(detailNotificationCovoiturageAller);
        }

        if(req.params.allerOuRetour === "retour"){
            const detailNotificationCovoiturageRetour = await Notifications.findById(req.params.id)
                                                                           .populate("demandes_covoit")
                                                                           .populate({path: "demandes_covoit",
                                                                                     populate: "trajets_retour"})

            res.json(detailNotificationCovoiturageRetour);
        }

    } catch(err){
        res.status(500).json({ msg: error.message });
    }
})

module.exports = router;