const router = require('express').Router();
const auth = require('../middleware/auth');
const MyMesCovoituragesSortByDayOfWeek = require('../middleware/classerParJour/sortMesCovoituragesByDayOfWeek');

const Equipage = require('../models/covoiturageEquipageModel');
const TrajetAller = require('../models/trajetAllerModel');
const TrajetRetour = require('../models/trajetRetourModel');
const Membre = require('../models/membreModel');
const Notification = require('../models/notification.model');

router.get("/afficher/:id", auth, async function(req, res){
    try{

        const mesCovoiturage = await Equipage.find({ $or: [ {conducteur: req.params.id}, 
                                                            { passagers: { $in: req.params.id } } ] })
                                                .populate("trajet_aller")
                                                .populate("trajet_retour")
                                                .populate("conducteur")
                                                .populate("passagers");
        
        MyMesCovoituragesSortByDayOfWeek(mesCovoiturage);

        res.json(mesCovoiturage);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet à un conducteur d'afficher son equipage à partir de son trajet
router.get("/afficher/parTrajet/:trajetId", auth, async function(req, res){
    try{
        const equipage = await Equipage.findOne({ $or: [ {trajet_aller: req.params.trajetId},
                                                   {trajet_retour: req.params.trajetId } ] } )
                                        .populate("trajet_aller")
                                        .populate("trajet_retour")
                                        .populate("conducteur")
                                        .populate("passagers");

        res.json(equipage);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

// Permet de trouver un équipage par l'id du membre, le jour du trajet et le type de trajet (aller ou retour)
router.get("/afficher-un/je-suis-passager/:id/:jour/:aller_ou_retour", auth, async function(req, res){
    try{

        const monCovoiturage = await Equipage.findOne({ $and: [ { passagers: { $in: req.params.id } },
                                                             { jour_trajet: req.params.jour },
                                                             { aller_ou_retour: req.params.aller_ou_retour } ] })
                                            .populate("trajet_aller")
                                            .populate("trajet_retour")
                                            .populate("conducteur")
                                            .populate("passagers");

        res.json(monCovoiturage);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// Permet de trouver un équipage par son id
router.get("/afficher-un/:id", auth, async function(req, res){
    try{
        const equipage = await Equipage.findById(req.params.id)
                                        .populate("trajet_aller")
                                        .populate("trajet_retour")
                                        .populate("conducteur");
        
        res.json(equipage);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// Permet à un passager de quitter un équipage
router.delete("/quitter-un/:equipageId/:membreId", auth, async function(req, res){
    try{
        const quitterUnEquipage = await Equipage.findById(req.params.equipageId);

        // On retire le membre qui quitte de l'équipage
        quitterUnEquipage.passagers.pull(req.params.membreId);

        // On créé la notification qui avertira le conducteur qu'un passager à quitté le covoiturage. Pour cela, on a besoin des 
        // données du conducteur
        const donneesConducteur = await Membre.findById(quitterUnEquipage.conducteur);

        // Comme on insère juste le trajet, pour que la personne sache qui quitte le covoiturage, on recherche son profil pour
        // insérer son prenom et son _id à la notification
        const donneesPassagerQuiQuitte = await Membre.findById(req.params.membreId);

        let nouvelleNotification = new Notification({
            notification_pour: "Quitter un covoiturage",
            membre_notif_id: donneesConducteur._id,
            membre_notif_prenom: donneesConducteur.prenom,
            membre_notif_nom: donneesConducteur.nom,
            passager_qui_quitte_prenom: donneesPassagerQuiQuitte.prenom,
            passager_qui_quitte_id: donneesPassagerQuiQuitte._id,
        });

        await quitterUnEquipage.save();

        // Le passager a quitté un équipage, on va retrouver son trajet afin de pouvoir repasser passager_sur_autre_trajet en false

        // S'il s'agissait d'un trajet aller
        if(quitterUnEquipage.aller_ou_retour === "aller"){

            const trajetPassager = await TrajetAller.findOne({ $and: [ { membre_id: req.params.membreId },
                                                                       { jour: quitterUnEquipage.jour_trajet } ] } );
            
            trajetPassager.passager_sur_autre_trajet = false;
            await trajetPassager.save();
        }
        // S'il s'agissait d'un trajet retour
        if(quitterUnEquipage.aller_ou_retour === "retour"){

            const trajetPassager = await TrajetRetour.findOne({ $and: [ { membre_id: req.params.membreId },
                                                                       { jour: quitterUnEquipage.jour_trajet } ] } );

            
            trajetPassager.passager_sur_autre_trajet = false;
            await trajetPassager.save();
        }

        // On récupère le trajet du conducteur pour modifier le nombre de place et l'augmenter de 1 puisqu'un passager part

        // S'il s'agit d'un trajet aller
        if(quitterUnEquipage.aller_ou_retour === "aller"){
            
            const modifierTrajetAller = await TrajetAller.findById(quitterUnEquipage.trajet_aller);
    
            modifierTrajetAller.nombre_de_places = modifierTrajetAller.nombre_de_places*1 + 1;

            // De plus s'il n'y a plus de passager dans l'équipage du trajet, il faut trouver le rôle du conducteur, s'il était 
            // hybride, il faut repasser conducteur_sur_ce_trajet en false pour le matching
            if(quitterUnEquipage.passagers.length === 0){

                // S'il n'est pas conducteur exclusif (il ne peut pas être passager exclusif, il était conducteur)
                // if(membrePourRole.role !== "Je suis conducteur exclusif"){
                if(donneesConducteur.role !== "Je suis conducteur exclusif"){
                    modifierTrajetAller.conducteur_sur_ce_trajet = false;
                }
            }
            // Qu'il n'y ait plus de passager ou pas on sauvegarde car on a augmenté le nombre de places
            await modifierTrajetAller.save();
            
            // Comme on a le trajet du conducteur, on peut l'insérer dans la notification afin qu'il sache quel trajet le passager 
            // a quitté
            nouvelleNotification.trajets_aller_quitte.push(modifierTrajetAller);
            // Il n'y aura plus de changement, on sauve maintenant
            await nouvelleNotification.save();
        }

        // s'il s'agit d'un trajet retour
        if(quitterUnEquipage.aller_ou_retour === "retour"){

            const modifierTrajetRetour = await TrajetRetour.findById(quitterUnEquipage.trajet_retour);

            modifierTrajetRetour.nombre_de_places = modifierTrajetRetour.nombre_de_places*1 + 1;

            // De plus s'il n'y a plus de passager dans l'équipage du trajet, il faut trouver le rôle du conducteur, s'il était 
            // hybride, il faut repasser conducteur_sur_ce_trajet en false pour le matching
            if(quitterUnEquipage.passagers.length === 0){

                // S'il n'est pas conducteur exclusif (il ne peut pas être passager exclusif, il était conducteur)
                if(donneesConducteur.role !== "Je suis conducteur exclusif"){

                    modifierTrajetRetour.conducteur_sur_ce_trajet = false;
                }
            }
            // Qu'il n'y ait plus de passager ou pas on sauvegarde car on a réaugmenté le nombre de places
            await modifierTrajetRetour.save();

            // Comme on a le trajet du conducteur, on peut l'insérer dans la notification afin qu'il sache quel trajet le passager 
            // a quitté
            nouvelleNotification.trajets_retour_quitte.push(modifierTrajetRetour);
            // Il n'y aura plus de changement, on sauve
            await nouvelleNotification.save();
        }

        res.json(nouvelleNotification);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// Permet à un conducteur d'afficher tous ses covoiturages avec un passager
// router.get("/afficher/conducteur/passager/:passagerId/:conducteurId", auth, async function(req, res){
router.get("/conducteur/un-passager/:passagerId/:conducteurId", auth, async function(req, res){
    try{

        const mesCovoiturageAvecUnPassager = await Equipage.find({ $and: [ { passagers: { $in: req.params.passagerId } },
                                                                     { conducteur: req.params.conducteurId } ] } )
                                                        .populate("trajet_aller")
                                                        .populate("trajet_retour");

        // On tri par jour de la semaine
        MyMesCovoituragesSortByDayOfWeek(mesCovoiturageAvecUnPassager);

        // Et ensuite par aller ou retour
        mesCovoiturageAvecUnPassager.sort(function sortByAllerOuRetour(a, b) {
            let aller_ou_retour1 = a.aller_ou_retour;
            let aller_ou_retour2 = b.aller_ou_retour;

            let comparison = 0;
            if(aller_ou_retour1 > aller_ou_retour2){
                comparison = 1;
            } else if(aller_ou_retour1 < aller_ou_retour2){
                comparison = -1;
            }
            return comparison;
        });

        res.json(mesCovoiturageAvecUnPassager);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet à un conducteur de faire sortir d'un ou plusieur(s) covoiturage(s) un passager
router.post("/conducteur/sortir-un-passager/:passagerId/:conducteurId", auth, async function(req, res){
    try{

        // le console.log de req.body donne un résultat de type: { checkItems: { equipage_id: true ou false } }
        // true si le membre coche la checkbox et false s'il la coche puis la décoche
        // Comme seuls les trues nous intéresse, on va sotocker les key(trajet_id) des valeurs === true dans la variable suivante:
        var equipagesSelectionnes = [];

        // On parcourt l'objet pour récupérer toutes les keys qui ont une valeur true pour les stocker dans l'array trajetsSelectionnes
        for(const [key, value] of Object.entries(req.body.checkItems)){
            if(value === true){
                equipagesSelectionnes = equipagesSelectionnes.concat(key);
            }
        }

        if(equipagesSelectionnes.length === 0){
            return res
                .status(400)
                .json({ msg: "Veuillez selectionner un ou plusieurs trajets"});
        }

        // On récupère les données du passager pour la notification
        const passagerProfil = await Membre.findById(req.params.passagerId);

        // On récupère les données du conducteur car on aura besoin de connaître son rôle s'il n'y a plus de passagers
        // dans son équipage (pour mettre conducteur_sur_ce_trajet en false si son rôle est mixte)
        const conducteurProfil = await Membre.findById(req.params.conducteurId);

        let nouvelleNotification = new Notification({
            notification_pour: "Sorti d'un covoiturage",
            membre_notif_id: req.params.passagerId,
            membre_notif_prenom: passagerProfil.prenom,
            membre_notif_nom: passagerProfil.nom,
            conducteur_qui_fait_sortir_prenom: conducteurProfil.prenom,
            conducteur_qui_fait_sortir_id: conducteurProfil._id
        });

        // On fait une boucle pour parcourir l'ensemble des equipages selectionnés
        for(let equipage of equipagesSelectionnes){
            const equipageTrouve = await Equipage.findById(equipage)
                                                 .populate("trajet_aller")
                                                 .populate("trajet_retour");

            if(equipageTrouve.aller_ou_retour === "aller"){
                // L'equipage est celui d'un trajet aller

                // On retire le passager de l'équipage
                equipageTrouve.passagers.pull(req.params.passagerId);

                // On ajoute le trajet quitté à la notification
                nouvelleNotification.trajets_aller_quitte.push(equipageTrouve.trajet_aller);

                // On gère le nombre de places disponibles pour le trajet
                equipageTrouve.trajet_aller.nombre_de_places = equipageTrouve.trajet_aller.nombre_de_places*1 + 1;

                // S'il s'agit du dernier passager et que le rôle du conducteur est hybride, on modifie conducteur_sur_ce_trajet
                if(equipageTrouve.passagers.length === 0){
                    equipageTrouve.trajet_aller.conducteur_sur_ce_trajet = false;
                }

                await equipageTrouve.trajet_aller.save();

                // Maintenant, on récupère le trajet correspondant du passager pour mettre en false passager_sur_autre_trajet
                const trajetPassager = await TrajetAller.findOne({ $and: [ 
                                        { membre_id: req.params.passagerId }, { jour: equipageTrouve.trajet_aller.jour} 
                                                                      ] } );
                
                trajetPassager.passager_sur_autre_trajet = false;

                await trajetPassager.save();

                await equipageTrouve.save();
            }
            if(equipageTrouve.aller_ou_retour === "retour"){
                // L'equipage est celui d'un trajet retour

                // On retire le passager de l'équipage
                equipageTrouve.passagers.pull(req.params.passagerId);

                // On ajoute le trajet quitté à la notification
                nouvelleNotification.trajets_retour_quitte.push(equipageTrouve.trajet_retour);

                // On gère le nombre de place disponibles sur le trajet
                equipageTrouve.trajet_retour.nombre_de_places = equipageTrouve.trajet_retour.nombre_de_places*1 + 1;

                // S'il s'agit du dernier passager et que le rôle du conducteur est hybride, on modifie conducteur_sur_ce_trajet
                if(equipageTrouve.passagers.length === 0){
                    equipageTrouve.trajet_retour.conducteur_sur_ce_trajet = false;
                }
                
                await equipageTrouve.trajet_retour.save();

                // Maintenant, on récupère le trajet correspondant du passager pour mettre en false passager_sur_autre_trajet
                const trajetPassager = await TrajetRetour.findOne({ $and: [ 
                                { membre_id: req.params.passagerId }, { jour: equipageTrouve.trajet_retour.jour} 
                                                                          ] } );

                trajetPassager.passager_sur_autre_trajet = false;
                
                await trajetPassager.save();

                await equipageTrouve.save();

            }
        }
        // Une fois la boucle terminée, on sauve la notification
        await nouvelleNotification.save();

        res.json(nouvelleNotification);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet à un passager d'afficher tous ses covoiturages avec un conducteur
router.get("/passager/un-conducteur/:passagerId/:conducteurId", auth, async function(req, res){
    try{

        const mesCovoiturageAvecUnConducteur = await Equipage.find({ $and: [ { passagers: { $in: req.params.passagerId } },
                                                                     { conducteur: req.params.conducteurId } ] } )
                                                        .populate("trajet_aller")
                                                        .populate("trajet_retour");

        // On tri par jour de la semaine
        MyMesCovoituragesSortByDayOfWeek(mesCovoiturageAvecUnConducteur);

        // Et ensuite par aller ou retour
        mesCovoiturageAvecUnConducteur.sort(function sortByAllerOuRetour(a, b) {
            let aller_ou_retour1 = a.aller_ou_retour;
            let aller_ou_retour2 = b.aller_ou_retour;

            let comparison = 0;
            if(aller_ou_retour1 > aller_ou_retour2){
                comparison = 1;
            } else if(aller_ou_retour1 < aller_ou_retour2){
                comparison = -1;
            }
            return comparison;
        });

        res.json(mesCovoiturageAvecUnConducteur);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet à un passager de quitter un ou plusieurs covoiturage du même conducteur
router.post("/passager/quitter-un-conducteur/:passagerId/:conducteurId", auth, async function(req, res){
    try{

        // le console.log de req.body donne un résultat de type: { checkItems: { equipage_id: true ou false } }
        // true si le membre coche la checkbox et false s'il la coche puis la décoche
        // Comme seuls les trues nous intéresse, on va sotocker les key(trajet_id) des valeurs === true dans la variable suivante:
        var equipagesSelectionnes = [];

        // On parcourt l'objet pour récupérer toutes les keys qui ont une valeur true pour les stocker dans l'array trajetsSelectionnes
        for(const [key, value] of Object.entries(req.body.checkItems)){
            if(value === true){
                equipagesSelectionnes = equipagesSelectionnes.concat(key);
            }
        }

        if(equipagesSelectionnes.length === 0){
            return res
                .status(400)
                .json({ msg: "Veuillez selectionner un ou plusieurs trajets"});
        }

        // On récupère les données du passager pour la notification
        const passagerProfil = await Membre.findById(req.params.passagerId);

        // On récupère les données du conducteur car on aura besoin de connaître son rôle s'il n'y a plus de passagers
        // dans son équipage (pour mettre conducteur_sur_ce_trajet en false si son rôle est mixte)
        const conducteurProfil = await Membre.findById(req.params.conducteurId);

        let nouvelleNotification = new Notification({
            notification_pour: "Quitter un covoiturage",
            membre_notif_id: req.params.conducteurId,
            membre_notif_prenom: conducteurProfil.prenom,
            membre_notif_nom: conducteurProfil.nom,
            passager_qui_quitte_prenom: passagerProfil.prenom,
            passager_qui_quitte_id: passagerProfil._id
        });

        // On fait une boucle pour parcourir l'ensemble des equipages selectionnés
        for(let equipage of equipagesSelectionnes){
            const equipageTrouve = await Equipage.findById(equipage)
                                                 .populate("trajet_aller")
                                                 .populate("trajet_retour");

            if(equipageTrouve.aller_ou_retour === "aller"){
                // L'equipage est celui d'un trajet aller

                // On retire le passager de l'équipage
                equipageTrouve.passagers.pull(req.params.passagerId);

                // On ajoute le trajet quitté à la notification
                nouvelleNotification.trajets_aller_quitte.push(equipageTrouve.trajet_aller);

                // On gère le nombre de places disponibles sur le trajet
                equipageTrouve.trajet_aller.nombre_de_places = equipageTrouve.trajet_aller.nombre_de_places*1 + 1;

                // S'il s'agit du dernier passager et que le rôle conducteur est mixte, on modifie conducteur_sur_ce_trajet
                if(equipageTrouve.passagers.length === 0){
                    equipageTrouve.trajet_aller.conducteur_sur_ce_trajet = false;
                }
                
                await equipageTrouve.trajet_aller.save();

                // Maintenant, on récupère le trajet correspondant du passager pour mettre en false passager_sur_autre_trajet
                const trajetPassager = await TrajetAller.findOne({ $and: [ 
                                        { membre_id: req.params.passagerId }, { jour: equipageTrouve.trajet_aller.jour} 
                                                                      ] } );
                
                trajetPassager.passager_sur_autre_trajet = false;
                
                await trajetPassager.save();
                await equipageTrouve.save();

            }
            if(equipageTrouve.aller_ou_retour === "retour"){
                // L'equipage est celui d'un trajet retour

                // On retire le passager de l'équipage
                equipageTrouve.passagers.pull(req.params.passagerId);

                // On ajoute le trajet quitté à la notification
                nouvelleNotification.trajets_retour_quitte.push(equipageTrouve.trajet_retour);

                // On gère le nombre de places disponibles sur le trajet
                equipageTrouve.trajet_retour.nombre_de_places = equipageTrouve.trajet_retour.nombre_de_places*1 + 1;

                // S'il s'agit du dernier passager et que le rôle du conducteur est mixte, on modifie conducteur_sur_ce_trajet
                if(equipageTrouve.passagers.length === 0){
                    equipageTrouve.trajet_retour.conducteur_sur_ce_trajet = false;
                }

                await equipageTrouve.trajet_retour.save();

                // Maintenant, on récupère le trajet correspondant du passager pour mettre en false passager_sur_autre_trajet
                const trajetPassager = await TrajetRetour.findOne({ $and: [ 
                                { membre_id: req.params.passagerId }, { jour: equipageTrouve.trajet_retour.jour} 
                                                                          ] } );

                trajetPassager.passager_sur_autre_trajet = false;
                
                await trajetPassager.save();
                await equipageTrouve.save();

            }
        }
        // Une fois la boucle terminée, on sauve la notification
        await nouvelleNotification.save();

        res.json(nouvelleNotification);
    } catch(err){
        return res.json({ error: err.message });
    }
});

module.exports = router;