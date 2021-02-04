const router = require("express").Router(); // Execute la version Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const DemandeCovoiturage = require("../models/covoiturageDemandeModel");
const Membre = require("../models/membreModel"); // Permet d'insérer les demandes au profil du membre
const TrajetAller = require("../models/trajetAllerModel"); // Permet d'insérer le trajet aller à la demande
const TrajetRetour = require("../models/trajetRetourModel"); // Permet d'insérer le trajet retour à la demande
const Notification = require("../models/notification.model"); // Permet de créer une notification suite à la demande de covoiturage
const Equipage = require("../models/covoiturageEquipageModel"); // Permet d'intégrer le membre dans un équipage lié au trajet en cas d'accord de demande de covoiturage

router.post("/creer/:demandeur_id/:receveur_id", auth, async function(req, res){
    // :demandeur_id -> personne qui demande le covoiturage pour le trajet (quel que soit son rôle)
    // :receveur_id -> personne qui va recevoir la demande et qui va soit accepter soit refuser la proposition du demandeur

    try{

        // le console.log de req.body donne un résultat de type: { checkItems: { trajet_id: true ou false } }
        // true si le membre coche la checkbox et false s'il la coche puis la décoche
        // Comme seuls les trues nous intéresse, on va sotocker les key(trajet_id) des valeurs === true dans la variable suivante:
        var trajetsDemandes = [];
    
        // On parcourt l'objet pour récupérer toutes les keys qui ont une valeur true pour les stocker dans l'array trajetsDemandes
        for(const [key, value] of Object.entries(req.body.checkItems)){
            if(value === true){
                trajetsDemandes = trajetsDemandes.concat(key);
            }
        }

        if(trajetsDemandes.length === 0){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner un ou plusieurs trajets "});
        }

        // Je n'arrive pas à modifier la valeur de passagerOuConducteur dans le front quand les l'un des membres est passager ou
        // conducteur exclusif. Quand j'essaie, j'ai une erreur me disant que j'ai trop de re-renders et qu'il craignent une boucle 
        // infinie. Je fais donc cette modification dans le back

        // On récupère les profils du demandeur et receveur. Cela servira aussi pour rentrer les données du receveur dans la notification
        const roleDemandeur = await Membre.findById(req.params.demandeur_id);
        const roleReceveur = await Membre.findById(req.params.receveur_id);

        if(roleDemandeur.role === "Je suis conducteur exclusif" || roleReceveur.role === "Je suis passager exclusif"){
            req.body.passagerOuConducteur = "Conducteur";
        }
        if(roleDemandeur.role === "Je suis passager exclusif" || roleReceveur.role === "Je suis conducteur exclusif"){
            req.body.passagerOuConducteur = "Passager";
        }

        if(!req.body.passagerOuConducteur || req.body.passagerOuConducteur === "Choisir"){
            return res
                .status(400)
                .send({msg: "Veuillez indiquer si vous souhaitez être passager ou conducteur pour cette demande"})
        }

        // Pour les 2 prochains if, on vérifie si une demande de covoiturage n'a pas déjà été faite pour un des trajets qui est demandé:
        // Si la demande concerne un(des) trajet(s) aller on populate les trajets aller:
        if(req.body.allerOuRetour === "aller"){
            for(let dejaUneDemandePourCeTrajet of trajetsDemandes){
                const demandeDejaFaite = await DemandeCovoiturage.find( { $and: [ { demandeur_id: req.params.demandeur_id },
                                                                                    { receveur_id: req.params.receveur_id },
                                                                                    { trajet_id: dejaUneDemandePourCeTrajet } ] } )
                                                                    .populate('trajets_aller')
                                                                    .sort({ date_demande: -1 });
                // Le tri par date (de la plus récente à la plus ancienne) permet de récupérer la dernière demande
                // qui a été faite
                
                if(demandeDejaFaite.length !== 0){
                    if(demandeDejaFaite[0].validee === false && demandeDejaFaite[0].annulee !== true){
                        // Si la demande n'a été ni acceptée ni refusée donc en cours
                        return res
                            .status(400)
                            .send({ msg: "Vous avez déjà une demande en cours pour le trajet du " + demandeDejaFaite[0].trajets_aller[0].jour.toLowerCase()})
                    }
                    if(demandeDejaFaite[0].acceptee === true){
                        // Si une demande a été faite et a été acceptée, on vérifie si la personne est toujours dans l'équipage
                        // ou si elle l'a quitté. On doit voir si l'equipage existe.
                        if(demandeDejaFaite[0].passager_ou_conducteur === "Conducteur"){
                            // Si c'est une demande conducteur, cela veut dire que le demandeur est conducteur
                            const equipageExiste = await Equipage.findOne({ $and: [ { aller_ou_retour: demandeDejaFaite[0].aller_ou_retour},
                                                                                 { jour_trajet: demandeDejaFaite[0].trajets_aller[0].jour},
                                                                                 { conducteur: demandeDejaFaite[0].demandeur_id}, 
                                                                                 { passagers: { $in: demandeDejaFaite[0].receveur_id} 
                                                                        } ] } );
                            if(equipageExiste){
                                return res
                                    .status(400)
                                    .send({ msg: "Une demande à déjà été faite pour le trajet du " + demandeDejaFaite[0].trajets_aller[0].jour.toLowerCase() + " elle a été acceptée"})
                            }
                        }
                        if(demandeDejaFaite.passager_ou_conducteur === "Passager"){
                            // Si c'est une demande passager, cela veut dire que le demandeur est passager
                            const equipageExiste = await Equipage.findOne({ $and: [ { aller_ou_retour: demandeDejaFaite[0].aller_ou_retour},
                                                                                    { jour_trajet: demandeDejaFaite[0].trajets_aller[0].jour},
                                                                                    { conducteur: demandeDejaFaite[0].demandeur_id}, 
                                                                                    { passagers: { $in: demandeDejaFaite[0].receveur_id} 
                                                                         } ] } );
                            if(equipageExiste){
                                return res
                                    .status(400)
                                    .send({ msg: "Une demande à déjà été faite pour le trajet du " + demandeDejaFaite[0].trajets_aller[0].jour.toLowerCase() + " elle a été acceptée"})
                            }
                        }
                    }
                }                                                                    
            }
        }
        if(req.body.allerOuRetour === "retour"){
            for(let dejaUneDemandePourCeTrajet of trajetsDemandes){
                const demandeDejaFaite = await DemandeCovoiturage.find( { $and: [ { demandeur_id: req.params.demandeur_id },
                                                                                    { receveur_id: req.params.receveur_id },
                                                                                    { trajet_id: dejaUneDemandePourCeTrajet } ] } )
                                                                    .populate('trajets_retour')
                                                                    .sort({ date_demande: -1 });
                // Le tri par date (de la plus récente à la plus ancienne) permet de récupérer la dernière demande
                // qui a été faite
                
                if(demandeDejaFaite.length !== 0){
                    if(demandeDejaFaite[0].validee === false && demandeDejaFaite[0].annulee !== true){
                        // Si la demande n'a été ni acceptée ni refusée donc en cours
                        return res
                            .status(400)
                            .send({ msg: "Vous avez déjà une demande en cours pour le trajet du " + demandeDejaFaite[0].trajets_retour[0].jour.toLowerCase()})
                    }
                    if(demandeDejaFaite[0].acceptee === true){
                        // Si une demande a été faite et a été acceptée, on vérifie si la personne est toujours dans l'équipage
                        // ou si elle l'a quitté. On doit voir si l'equipage existe.
                        if(demandeDejaFaite[0].passager_ou_conducteur === "Conducteur"){
                            // Si c'est une demande conducteur, cela veut dire que le demandeur est conducteur
                            const equipageExiste = await Equipage.findOne({ $and: [ { aller_ou_retour: demandeDejaFaite[0].aller_ou_retour},
                                                                                 { jour_trajet: demandeDejaFaite[0].trajets_retour[0].jour},
                                                                                 { conducteur: demandeDejaFaite[0].demandeur_id}, 
                                                                                 { passagers: { $in: demandeDejaFaite[0].receveur_id} 
                                                                        } ] } );
                            if(equipageExiste){
                                return res
                                    .status(400)
                                    .send({ msg: "Une demande à déjà été faite pour le trajet du " + demandeDejaFaite[0].trajets_retour[0].jour.toLowerCase() + " elle a été acceptée"})
                            }
                        }
                        if(demandeDejaFaite.passager_ou_conducteur === "Passager"){
                            // Si c'est une demande passager, cela veut dire que le demandeur est passager
                            const equipageExiste = await Equipage.findOne({ $and: [ { aller_ou_retour: demandeDejaFaite[0].aller_ou_retour},
                                                                                    { jour_trajet: demandeDejaFaite[0].trajets_retour[0].jour},
                                                                                    { conducteur: demandeDejaFaite[0].demandeur_id}, 
                                                                                    { passagers: { $in: demandeDejaFaite[0].receveur_id} 
                                                                         } ] } );
                            if(equipageExiste){
                                return res
                                    .status(400)
                                    .send({ msg: "Une demande à déjà été faite pour le trajet du " + demandeDejaFaite[0].trajets_retour[0].jour.toLowerCase() + " elle a été acceptée"})
                            }
                        }
                    }
                }                                                                    
            }
        }
        // A decommenter pour les tests pour les élements bloquant demandes de covoiturages
        // return res
        //     .status(400)
        //     .send({ msg: "Toutes les vérifications sont passées"})

        // Si la demande concerne un(des) trajet(s) retour on populate les trajets retour:
        if(req.body.allerOuRetour === "retour"){
            for(let dejaUneDemandePourCeTrajet of trajetsDemandes){
                const demandeDejaFaite = await DemandeCovoiturage.find( { $and: [ { demandeur_id: req.params.demandeur_id },
                                                                                    { receveur_id: req.params.receveur_id },
                                                                                    { trajet_id: dejaUneDemandePourCeTrajet } ] } )
                                                                    .populate('trajets_retour')
                                                                    .sort({ date_demande: -1 });
                
                if(demandeDejaFaite.length !== 0){
                    if(demandeDejaFaite[0].validee === false){
                        // Si la demande n'a été ni acceptée ni refusée donc en cours
                        // Le tri par date (de la plus récente à la plus ancienne) permet de récupérer la dernière demande
                        // qui a été faite
                        return res
                            .status(400)
                            .send({ msg: "Vous avez déjà une demande en cours pour le trajet du " + demandeDejaFaite[0].trajets_retour[0].jour.toLowerCase()})
                        
                    }
                    if(demandeDejaFaite[0].acceptee === true){
                        // Si une demande a été faite et a été acceptée, on vérifie si la personne est toujours dans l'équipage
                        // ou si elle l'a quitté. On doit voir si l'equipage existe.
                        if(demandeDejaFaite[0].passager_ou_conducteur === "Conducteur"){
                            // Si c'est une demande conducteur, cela veut dire que le demandeur est conducteur
                            const equipageExiste = await Equipage.findOne({ $and: [ { aller_ou_retour: demandeDejaFaite[0].aller_ou_retour},
                                                                                 { jour_trajet: demandeDejaFaite[0].trajets_retour[0].jour},
                                                                                 { conducteur: demandeDejaFaite[0].demandeur_id}, 
                                                                                 { passagers: { $in: demandeDejaFaite[0].receveur_id} 
                                                                        } ] } );
                            if(equipageExiste){
                                return res
                                    .status(400)
                                    .send({ msg: "Une demande à déjà été faite pour le trajet du " + demandeDejaFaite[0].trajets_retour[0].jour.toLowerCase() + " elle a été acceptée"})
                            }
                        }
                        if(demandeDejaFaite.passager_ou_conducteur === "Passager"){
                            // Si c'est une demande passager, cela veut dire que le demandeur est passager
                            const equipageExiste = await Equipage.findOne({ $and: [ { aller_ou_retour: demandeDejaFaite[0].aller_ou_retour},
                                                                                    { jour_trajet: demandeDejaFaite[0].trajets_retour[0].jour},
                                                                                    { conducteur: demandeDejaFaite[0].demandeur_id}, 
                                                                                    { passagers: { $in: demandeDejaFaite[0].receveur_id} 
                                                                         } ] } );
                            if(equipageExiste){
                                return res
                                    .status(400)
                                    .send({ msg: "Une demande à déjà été faite pour le trajet du " + demandeDejaFaite[0].trajets_retour[0].jour.toLowerCase() + " elle a été acceptée"})
                            }
                        }
                    }
                }                                                                    
            }
        }

        // On crée la notification qui apparaitera à la connexion du membre s'il a reçu des demandes de covoiturage
        // Il y aura une seule notification pour l'ensemble des trajets demandés
        let notification = new Notification({
            membre_notif_id: roleReceveur._id,
            membre_notif_prenom: roleReceveur.prenom,
            membre_notif_nom: roleReceveur.nom,
            notification_pour: "Demande covoiturage"
        });

        // On fait une boucle pour enregistrer chaques trajets demandés
        // Il y a une demande de covoiturage créée par trajet pour que la personne puisse en accépter que certaines et cela permettra
        // de faire des statistiques su le nombre de trajets accéptés et/ou refusés
        for(let trajet of trajetsDemandes){

            let demande = new DemandeCovoiturage({
                aller_ou_retour: req.body.allerOuRetour,
                passager_ou_conducteur: req.body.passagerOuConducteur,
                demandeur_id: req.params.demandeur_id,
                demandeur_nom: roleDemandeur.nom,
                demandeur_prenom: roleDemandeur.prenom,
                receveur_id: req.params.receveur_id,
                receveur_nom: roleReceveur.nom,
                receveur_prenom: roleReceveur.prenom,
                trajet_id: trajet
            });

            if(req.body.allerOuRetour === "aller"){
                await TrajetAller.findById(trajet, async (err, trajet_aller) => {
                    if(trajet_aller){
                        await demande.trajets_aller.push(trajet_aller);
                        await trajet_aller.demandes_covoiturage.push(demande);
                        await trajet_aller.save();
                    }
                })
            }
            // Si la demande est pour un trajet retour, on l'enregistre dans le bon model
            if(req.body.allerOuRetour === "retour"){
                await TrajetRetour.findById(trajet, async (err, trajet_retour) => {
                    if(trajet_retour){
                        await demande.trajets_retour.push(trajet_retour);
                        
                        await trajet_retour.demandes_covoiturage.push(demande);
                        await trajet_retour.save();
                    }
                })
            }
            // On insère la demande dans la notification
            await notification.demandes_covoit.push(demande);

            // On insère la notification dans la demande
            demande.notification = notification;
            await demande.save();
        }
        // On sauvegarde la notification une fois que toutes les demande la concernant y ont été insérées
        await notification.save();

        res.json(notification);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher/envoyees/:id", auth, async function(req, res){
    try{
        const mesDemandes = await DemandeCovoiturage.find({ $and: [ { demandeur_id: req.params.id },
                                                                    { validee: false }, 
                                                                    { annulee: { $ne: true } }] } )
                                                                    // { annulee: false } ] } )
                                                    .populate("trajets_aller")
                                                    .populate("trajets_retour");
        res.json(mesDemandes);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

router.get("/afficher/acceptees/envoyees/:id", auth, async function(req, res){
    try{
        const mesDemandesAcceptees = await DemandeCovoiturage.find({ $and: [ { demandeur_id: req.params.id },
                                                                            { acceptee: true } ] } )
                                                            .populate("trajets_aller")
                                                            .populate("trajets_retour");
        res.json(mesDemandesAcceptees);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

router.get("/afficher/refusees/envoyees/:id", auth, async function(req, res){
    try{
        const mesDemandesRefusees = await DemandeCovoiturage.find({ $and: [ { demandeur_id: req.params.id },
                                                                            { acceptee: false } ] } )
                                                            .populate("trajets_aller")
                                                            .populate("trajets_retour");
        res.json(mesDemandesRefusees);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// On utilise un .post (dans le front et le back) au lieu d'un point delete car comme on envoie du contenu via les checkboxs,
// avec le .delete j'ai une erreur de token undefined
router.post("/supprimer/:id", auth, async function(req, res){ 
    try{
        // :id est l'_id du membre à supprimer
        var quellesDemandesSupprimer = [];

        // On parcourt l'objet pour récupérer toutes les keys qui ont une valeur true pour les stocker dans l'array trajetsDemandes
        for(const [key, value] of Object.entries(req.body.checkItems)){
            if(value === true){
                quellesDemandesSupprimer = quellesDemandesSupprimer.concat(key);
            }
        }
        if(quellesDemandesSupprimer.length === 0){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner une ou plusieur(s) demande(s) de covoiturage à supprimer"});
        }

        // On parcours l'ensemble des id de demandes de covoiturage à supprimer
        for(uneDemandeSupprimer of quellesDemandesSupprimer){
            // On recupère la demande de covoiturage à supprimer
            const demandeASupprimer = await DemandeCovoiturage.findById(uneDemandeSupprimer)
                                                              .populate("trajets_aller")
                                                              .populate("trajets_retour")
                                                              .populate("notification");

            // On retire la demande de covoiturage de la notification
            demandeASupprimer.notification.demandes_covoit.pull(uneDemandeSupprimer);

            // Et on la met dans les demandes annulées
            demandeASupprimer.notification.demandes_covoit_annulees.push(uneDemandeSupprimer);

            // On enregistre la modification faite à la notification:
            // A decommenter une fois les tests terminés:
            await demandeASupprimer.notification.save();

            // On indique que la demande est annulée:
            demandeASupprimer.annulee = true;
            demandeASupprimer.date_annulation = Date.now();

            await demandeASupprimer.save();
        }
        res.json("OK");
        
    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// La route est un post car on envoie des infos via les checkboxs
router.post("/accepter", auth, async function(req, res){
    try{
        // le console.log de req.body donne un résultat de type: { checkItems: { trajet_id: true ou false } }
        // true si le membre coche la checkbox et false s'il la coche puis la décoche
        // Comme seuls les trues nous intéresse, on va sotocker les key(trajet_id) des valeurs === true dans la variable suivante:
        var demandesAcceptees = [];

        // On parcourt l'objet pour récupérer toutes les keys qui ont une valeur true pour les stocker dans l'array trajetsDemandes
        for(const [key, value] of Object.entries(req.body.checkItems)){
            if(value === true){
                demandesAcceptees = demandesAcceptees.concat(key);
            }
        }

        if(demandesAcceptees.length === 0){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner une ou plusieurs demandes de covoiturage que vous souhaitez accepter"});
        }

        // On récupère les données du demandeur et receveur de la demande de covoiturage
        const donneesDemandeurEtReceveur = await DemandeCovoiturage.findById(demandesAcceptees[0]);

        // Avant de valider les demandes de covoiturage et de faire les modifications (créer une notification, l'équipage), on va
        // d'abord vérifier toutes les erreurs possibles (entre le moment où la demande de covoit a été faite et son acceptation,
        // d'autres ont peut-être été acceptées entre-temps et il n'y a plus de places disponibles ).
        // Je préfère le faire avant d'enregistrer les modifs en cas d'accord pour éviter que si une erreur arrive à la 2ième 
        // demande de la boucle par exemple, que le processus s'arrête en plein milieu à cause du return res.send. S'il y a une 
        // demande qui bloque, aucune modification de faite mais l'explication remonte au front, sinon, tout est validé

        // On fait donc une boucle for pour parcourir tous les demandes et voir s'il y a un élément bloquant
        for(let onRechercheCeQuiPeutBloquer of demandesAcceptees){
            // On recherche la demande de covoiturage
            const elementBloquantDemandeCovoiturage = await DemandeCovoiturage.findById(onRechercheCeQuiPeutBloquer);

            // 2 cas de figures, la demande a été faite pour un aller ou un retour, les 2 ifs nous permettront d'agir selon le cas
            // pour le modifier
            if(elementBloquantDemandeCovoiturage.trajets_retour.length === 0){
                // Si trajets_retour.length === 0, il est donc vide et la demande concerne donc un trajet aller

                const elementBloquantTrajetAller = await TrajetAller.findById(elementBloquantDemandeCovoiturage.trajets_aller[0]);

                // Le membre qui accepte a reçu une demande conducteur, il sera donc passager pour le trajet
                if(elementBloquantDemandeCovoiturage.passager_ou_conducteur === "Conducteur"){
                    // On vérifie qu'il y a toujours un nombre valide de places disponibles. Comme la demande a été faite sur le
                    // trajet de la personne qui accepte ou refuse, il faut récupérer le trajet du conducteur pour connaître le
                    // nombres de places encore disponibles

                    const elementBloquantTrajetDuConducteur = await TrajetAller.findOne( { $and: [ { membre_id: donneesDemandeurEtReceveur.demandeur_id},
                                                                                    { jour: elementBloquantTrajetAller.jour} ] } );

                    if(elementBloquantTrajetDuConducteur.nombre_de_places*1 === 0){
                        // Il n'y a plus de places, on envoie l'information au front
                        return res
                            .status(400)
                            .send({ msg: "Il n'y a plus de places disponibles pour le trajet aller du " + elementBloquantTrajetAller.jour.toLowerCase() + ". Vous ne pouvez que refuser ce trajet et pouvez indiquer le motif correpondant"})
                    }
                    // On vérifie que la personne qui accepte n'a pas déjà accepté un trajet en tant que passager
                    if(elementBloquantTrajetAller.passager_sur_autre_trajet === true){
                        // La personne qui accepte est déjà passager sur un autre trajet
                        return res
                            .status(400)
                            .send({ msg: "Vous avez déjà trouvé un conducteur pour le trajet aller du " + elementBloquantTrajetAller.jour.toLowerCase() + ". Vous ne pouvez que refuser ce trajet et pouvez indiquer le motif correpondant"})
                    }
                }
                // Le membre qui accepte a reçu une demande passager, il sera donc conducteur pour le trajet
                if(elementBloquantDemandeCovoiturage.passager_ou_conducteur === "Passager"){
                    // On vérifie que le demandeur est toujours disponible pour le trajet. Il a peut-être accepté une demande de 
                    // covoiturage similaire entre-temps
                    // On vérifie qu'il y a toujours un nombre valide de places disponibles
                    if(elementBloquantTrajetAller.nombre_de_places*1 === 0){
                        // Il n'y a plus de places, on envoie l'information au front
                        return res
                            .status(400)
                            .send({ msg: "Vous n'avez plus de places disponibles pour le trajet aller du " + elementBloquantTrajetAller.jour.toLowerCase() + ". Vous ne pouvez que refuser ce trajet et pouvez indiquer le motif correpondant"})
                    }
                    // On récupère le trajet du passager (demandeur) pour savoir s'il n'est pas passager sur un autre trajet
                    const trajetAllerPassager = await TrajetAller.findOne({ $and: [ {membre_id: donneesDemandeurEtReceveur.demandeur_id},
                                                                                    { jour: elementBloquantTrajetAller.jour } ] } );
                    
                    if(trajetAllerPassager.passager_sur_autre_trajet === true){
                        // Le trajet n'est plus disponible, on envoie l'information au front
                        return res
                            .status(400)
                            .send({ msg: trajetAllerPassager.prenom + " a trouvé un covoiturage pour le " + elementBloquantTrajetAller.jour.toLowerCase() + ". Vous ne pouvez que refuser ce trajet et pouvez indiquer le motif correpondant"})
                    }

                }
            }
            // On refait la même chose pour les trajets retour:
            if(elementBloquantDemandeCovoiturage.trajets_aller.length === 0){
                // Si trajets_aller.length === 0, il est donc vide et la demande concerne donc un trajet retour
                const elementBloquantTrajetRetour = await TrajetRetour.findById(elementBloquantDemandeCovoiturage.trajets_retour[0]);

                // Le membre qui accepte a reçu une demande conducteur, il sera donc passager pour le trajet
                if(elementBloquantDemandeCovoiturage.passager_ou_conducteur === "Conducteur"){
                    // On vérifie qu'il y a toujours un nombre valide de places disponibles. Comme la demande a été faite sur le
                    // trajet de la personne qui accepte ou refuse, il faut récupérer le trajet du conducteur pour connaître le
                    // nombres de places encore disponibles
                    const elementBloquantTrajetDuConducteur = await TrajetRetour.findOne( { $and: [ { membre_id: donneesDemandeurEtReceveur.demandeur_id},
                                                                                    { jour: elementBloquantTrajetRetour.jour} ] } );
                    if(elementBloquantTrajetDuConducteur.nombre_de_places*1 === 0){
                        // Il n'y a plus de places, on envoie l'information au front
                        return res
                            .status(400)
                            .send({ msg: "Il n'y a plus de places disponibles pour le trajet retour du " + elementBloquantTrajetRetour.jour.toLowerCase() + ". Vous ne pouvez que refuser ce trajet et pouvez indiquer le motif correpondant"})
                    }
                    // On vérifie que la personne qui accepte n'a pas déjà accepté un trajet en tant que passager
                    if(elementBloquantTrajetRetour.passager_sur_autre_trajet === true){
                        // La personne qui accepte est déjà passager sur un autre trajet
                        return res
                            .status(400)
                            .send({ msg: "Vous avez déjà trouvé un conducteur pour le trajet retour du " + elementBloquantTrajetRetour.jour.toLowerCase() + ". Vous ne pouvez que refuser ce trajet et pouvez indiquer le motif correpondant"})
                    }
                }
                // Le membre qui accepte a reçu une demande passager, il sera donc conducteur pour le trajet
                if(elementBloquantDemandeCovoiturage.passager_ou_conducteur === "Passager"){
                    // On vérifie qu'il y a toujours un nombre valide de places disponibles
                    if(elementBloquantTrajetRetour.nombre_de_places*1 === 0){
                        // Il n'y a plus de places, on envoie l'information au front
                        return res
                        .status(400)
                        .send({ msg: "Vous n'avez plus de places disponibles pour le trajet retour du " + elementBloquantTrajetRetour.jour.toLowerCase() + ". Vous ne pouvez que refuser ce trajet et pouvez indiquer le motif correpondant"})
                    }
                    // On vérifie que le demandeur est toujours disponible pour le trajet. Il a peut-être accepté une demande de 
                    // covoiturage similaire entre-temps. On recupère donc son trajet correspondant
                    const trajetRetourPassager = await TrajetRetour.findOne({ $and: [ {membre_id: donneesDemandeurEtReceveur.demandeur_id},
                                                                                    { jour: elementBloquantTrajetRetour.jour } ] } );
                    if(trajetRetourPassager.passager_sur_autre_trajet === true){
                        // Le trajet n'est plus disponible, on envoie l'information au front
                        return res
                            .status(400)
                            .send({ msg: trajetRetourPassager.prenom + " a trouvé un covoiturage pour le " + elementBloquantTrajetRetour.jour.toLowerCase() + ". Vous ne pouvez que refuser ce trajet et pouvez indiquer le motif correpondant"})
                    }
                }
            }
        }

        // Maintenant que toutes les vérifications sont faites, en enregistre les demandes acceptées

        // On crée la notification qui apparaitera à la connexion du membre s'il a reçu une réponse à ses demandes de covoiturage
        // Il y aura une seule notification pour l'ensemble des demandes acceptées
        let notification = new Notification({
            membre_notif_id: donneesDemandeurEtReceveur.demandeur_id,
            membre_notif_prenom: donneesDemandeurEtReceveur.demandeur_prenom,
            membre_notif_nom: donneesDemandeurEtReceveur.demandeur_nom,
            notification_pour: "Accord demande covoiturage"
        });

        // On récupère la notification pour retirer les demandes de covoiturages acceptées
        const modifierNotification = await Notification.findById(req.body.id);
        
        // Une boucle for pour trouver toutes les demandes de covoiturages qui ont été cochées pour accord dans le front
        for(let demandeAcceptee of demandesAcceptees){
            const accordDemandeCovoiturage = await DemandeCovoiturage.findById(demandeAcceptee);

            // On indique que la demande de covoiturage est accepté, validée et la date d'accord
            accordDemandeCovoiturage.acceptee = true,
            accordDemandeCovoiturage.validee = true,
            accordDemandeCovoiturage.date_accord_ou_refus = Date.now();

            await accordDemandeCovoiturage.save();

            // On retire la demande de covoiturage acceptée de l'ancienne notification (celle de la demande de covoiturage)
            await modifierNotification.demandes_covoit.pull(demandeAcceptee);
            // Et on l'insère dans le champ demandes_covoit_acceptees
            await modifierNotification.demandes_covoit_acceptees.push(demandeAcceptee);
            
            await modifierNotification.save();
            
            // 2 cas de figures, la demande a été faite pour un aller ou un retour, les 2 ifs nous permettront d'agir selon le cas
            // pour le modifier
            if(accordDemandeCovoiturage.trajets_retour.length === 0){
                // Si trajets_retour.length === 0, il est donc vide et la demande concerne un trajet aller

                // Le trajet que l'on va trouver est celui de la personne qui a été matchée
                const trajetDeLaDemandeDeCovoiturage = await TrajetAller.findById(accordDemandeCovoiturage.trajets_aller[0]);

                // 2 nouveaux cas de figure:
                // Le membre qui accepte a reçu une demande Conducteur, il sera donc passager pour le trajet
                if(accordDemandeCovoiturage.passager_ou_conducteur === "Conducteur"){
                    // On modifie le trajet matché pour qu'il n'apparaisse plus dans les demandes de covoiturage puisque le passager
                    // a trouvé son conducteur
                    trajetDeLaDemandeDeCovoiturage.passager_sur_autre_trajet = true;

                    await trajetDeLaDemandeDeCovoiturage.save();

                    // La demande a été faite sur le trajet de la personne qui accepte ou refuse, il faut récupérer le trajet du conducteur
                    const trajetAllerConducteur = await TrajetAller.find( { $and: [ { membre_id: donneesDemandeurEtReceveur.demandeur_id},
                                                                                    { jour: trajetDeLaDemandeDeCovoiturage.jour} ] } );

                    // Maintenant, on diminue de 1 le nombre de places disponibles dans le trajet du conducteur
                    trajetAllerConducteur[0].nombre_de_places = trajetAllerConducteur[0].nombre_de_places*1 - 1;

                    // Si ce n'est pas le cas, on indique sur le trajet du conducteur est conducteur sur ce trajet pour 
                    // faciliter le matching
                    if(trajetAllerConducteur[0].conducteur_sur_ce_trajet === false){
                        trajetAllerConducteur[0].conducteur_sur_ce_trajet = true;
                    }
                    
                    await trajetAllerConducteur[0].save();

                    // On regarde si un équipage a déjà été créé pour ce trajet
                    const equipageExiste = await Equipage.findOne({ trajet_aller: trajetAllerConducteur[0]._id});
                    
                    if(equipageExiste){
                        // Il y a déjà un équipage pour ce trajet, on va le récupérer
                        equipageExiste.passagers.push(donneesDemandeurEtReceveur.receveur_id);

                        await equipageExiste.save();
                    } 
                    if(!equipageExiste) {
                        // Il n'y a pas d'équipage pour ce trajet, on va le créer
                        let nouvelEquipage = new Equipage({
                            creation: Date.now(),
                            aller_ou_retour: 'aller',
                            jour_trajet: trajetAllerConducteur[0].jour,
                            conducteur: donneesDemandeurEtReceveur.demandeur_id,
                            passagers: donneesDemandeurEtReceveur.receveur_id,
                            trajet_aller: trajetAllerConducteur[0]._id,
                        });

                        await nouvelEquipage.save();
                    }
                }
                // Le membre qui accepte a reçu une demande Passager, il sera donc conducteur pour le trajet
                if(accordDemandeCovoiturage.passager_ou_conducteur === "Passager"){
                    // Le profil matché est celui du conducteur, on vérifie si l'équipage existe ou pas
                    const equipageExiste = await Equipage.findOne({trajet_aller: trajetDeLaDemandeDeCovoiturage._id})
                    if(equipageExiste){
                        equipageExiste.passagers.push(donneesDemandeurEtReceveur.demandeur_id);

                        await equipageExiste.save();
                    } 
                    if(!equipageExiste) {
                        // Il n'y a pas d'équipage pour le trajet, on le créé
                        let nouvelEquipage = new Equipage({
                            creation: Date.now(),
                            aller_ou_retour: "aller",
                            jour_trajet: trajetDeLaDemandeDeCovoiturage.jour,
                            conducteur: donneesDemandeurEtReceveur.receveur_id,
                            passagers: donneesDemandeurEtReceveur.demandeur_id,
                            trajet_aller: trajetDeLaDemandeDeCovoiturage._id,
                        });

                        await nouvelEquipage.save();
                    }
                    // On récupère le trajet de la personne (passager) pour pouvoir rendre son trajet non disponible pour les
                    // futurs matching étant donné qu'elle a trouvé son conducteur
                    const trajetAllerPassager = await TrajetAller.find({ $and: [ { membre_id: donneesDemandeurEtReceveur.demandeur_id},
                                                                                { jour: trajetDeLaDemandeDeCovoiturage.jour } ] } );

                    trajetAllerPassager[0].passager_sur_autre_trajet = true;

                    await trajetAllerPassager[0].save();

                    // On retire une place disponible dans le trajet de la personne qui accepte qui est conducteur pour le trajet
                    trajetDeLaDemandeDeCovoiturage.nombre_de_places = trajetDeLaDemandeDeCovoiturage.nombre_de_places*1 - 1;

                    // Si ce n'est pas le cas, on indique que la membre est conducteur sur ce trajet pour faciliter le matching
                    if(trajetDeLaDemandeDeCovoiturage.conducteur_sur_ce_trajet === false){
                        trajetDeLaDemandeDeCovoiturage.conducteur_sur_ce_trajet = true;
                    }
                    await trajetDeLaDemandeDeCovoiturage.save();
                }
            }
            // On fait la même chose pour les retours:
            if(accordDemandeCovoiturage.trajets_aller.length === 0){
                // Si trajets_aller.length === 0, il est donc vide et la demande concerne un trajet retour

                // Le trajet que l'on va trouver est celui de la personne qui a été matchée
                const trajetDeLaDemandeDeCovoiturage = await TrajetRetour.findById(accordDemandeCovoiturage.trajets_retour[0]);

                // 2 nouveaux cas de figure:
                // Le membre qui accepte a reçu une demande Conducteur, il sera donc passager pour le trajet
                if(accordDemandeCovoiturage.passager_ou_conducteur === "Conducteur"){
                    // On modifie le trajet matché pour qu'il n'apparaisse plus dans les demandes de covoiturage puisque le passager
                    // a trouvé son conducteur
                    trajetDeLaDemandeDeCovoiturage.passager_sur_autre_trajet = true;

                    await trajetDeLaDemandeDeCovoiturage.save();

                    // La demande a été faite sur le trajet de la personne qui accepte ou refuse, il faut récupérer le trajet du conducteur
                    const trajetRetourConducteur = await TrajetRetour.find( { $and: [ { membre_id: donneesDemandeurEtReceveur.demandeur_id},
                                                                                    { jour: trajetDeLaDemandeDeCovoiturage.jour} ] } );

                    // Maintenant, on diminue de 1 le nombre de places disponibles dans le trajet du conducteur
                    trajetRetourConducteur[0].nombre_de_places = trajetRetourConducteur[0].nombre_de_places - 1;

                    // Si ce n'est pas le cas, on indique sur le trajet du conducteur est conducteur sur ce trajet pour 
                    // faciliter le matching
                    if(trajetRetourConducteur[0].conducteur_sur_ce_trajet === false){
                        trajetRetourConducteur[0].conducteur_sur_ce_trajet = true;
                    }

                    await trajetRetourConducteur[0].save();

                    // On regarde si un équipage a déjà été créé pour ce trajet
                    const equipageExiste = await Equipage.findOne({trajet_retour: trajetRetourConducteur[0]._id});
                    if(equipageExiste){
                        // Il y a déjà un équipage pour ce trajet, on va le récupérer
                        equipageExiste.passagers.push(donneesDemandeurEtReceveur.receveur_id);

                        await equipageExiste.save();
                    } 
                    if(!equipageExiste){
                        // Il n'y a pas d'équipage pour ce trajet, on va le créer
                        let nouvelEquipage = new Equipage({
                            creation: Date.now(),
                            aller_ou_retour: 'retour',
                            jour_trajet: trajetRetourConducteur[0].jour,
                            conducteur: donneesDemandeurEtReceveur.demandeur_id,
                            passagers: donneesDemandeurEtReceveur.receveur_id,
                            trajet_retour: trajetRetourConducteur[0]._id,
                        });

                        await nouvelEquipage.save();
                    }
                }
                // Le membre qui accepte a reçu une demande Passager, il sera donc conducteur pour le trajet
                if(accordDemandeCovoiturage.passager_ou_conducteur === "Passager"){
                    // Le profil matché est celui du conducteur, on vérifie si l'équipage existe ou pas
                    const equipageExiste = await Equipage.findOne({ trajet_retour: trajetDeLaDemandeDeCovoiturage._id});

                    if(equipageExiste){
                        equipageExiste.passagers.push(donneesDemandeurEtReceveur.demandeur_id);
                        
                        await equipageExiste.save();
                    } 
                    if(!equipageExiste){
                        // Il n'y a pas d'équipage pour le trajet, on le créé
                        let nouvelEquipage = new Equipage({
                            creation: Date.now(),
                            aller_ou_retour: 'retour',
                            jour_trajet: trajetDeLaDemandeDeCovoiturage.jour,
                            conducteur: donneesDemandeurEtReceveur.receveur_id,
                            passagers: donneesDemandeurEtReceveur.demandeur_id,
                            trajet_retour: trajetDeLaDemandeDeCovoiturage._id,
                        });

                        await nouvelEquipage.save();
                    }
                    // On récupère le trajet de la personne (passager) pour pouvoir rendre son trajet non disponible pour les
                    // futurs matching étant donné qu'elle a trouvé son conducteur
                    const trajetRetourPassager = await TrajetRetour.find({ $and: [ { membre_id: donneesDemandeurEtReceveur.demandeur_id},
                                                                                    { jour: trajetDeLaDemandeDeCovoiturage.jour } ] } );

                    trajetRetourPassager[0].passager_sur_autre_trajet = true;

                    await trajetRetourPassager[0].save();

                    // On retire une place disponible dans le trajet de la personne qui accepte qui est conducteur pour le trajet
                    trajetDeLaDemandeDeCovoiturage.nombre_de_places = trajetDeLaDemandeDeCovoiturage.nombre_de_places*1 - 1;
                    // Si ce n'est pas le cas, on indique que la membre est conducteur sur ce trajet pour faciliter le matching
                    if(trajetDeLaDemandeDeCovoiturage.conducteur_sur_ce_trajet === false){
                        trajetDeLaDemandeDeCovoiturage.conducteur_sur_ce_trajet = true;
                    }
                    await trajetDeLaDemandeDeCovoiturage.save();
                }
            }
            // On enregistre les demandes acceptées dans la notification:
            await notification.demandes_covoit_acceptees.push(demandeAcceptee);
        }
        await notification.save();

        res.json(notification);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

router.post("/refuser", auth, async function(req, res){
    try{
        // le console.log de req.body donne un résultat de type: { checkItems: { trajet_id: true ou false } }
        // true si le membre coche la checkbox et false s'il la coche puis la décoche
        // Comme seuls les trues nous intéresse, on va sotocker les key(trajet_id) des valeurs === true dans la variable suivante:
        var demandesRefusees = [];

        // On parcourt l'objet pour récupérer toutes les keys qui ont une valeur true pour les stocker dans l'array trajetsDemandes
        for(const [key, value] of Object.entries(req.body.checkItems)){
            if(value === true){
                demandesRefusees = demandesRefusees.concat(key);
            }
        }

        if(demandesRefusees.length === 0){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner une ou plusieurs demandes de covoiturage que vous souhaitez refuser" });
        }

        // On récupère les données de la personne qui a fait la demande de covoiturage pour lui envoyer la notification de refus
        const donneesDemandeurEtReceveur = await DemandeCovoiturage.findById(demandesRefusees[0]);

        // On crée la notification qui apparaitera à la connexion du membre s'il a reçu une réponse à ses demandes de covoiturage
        // Il y aura une seule notification pour l'ensemble des demandes refuseés
        let notification = new Notification({
            membre_notif_id: donneesDemandeurEtReceveur.demandeur_id,
            membre_notif_prenom: donneesDemandeurEtReceveur.demandeur_prenom,
            membre_notif_nom: donneesDemandeurEtReceveur.demandeur_nom,
            notification_pour: "Refus demande covoiturage"
        });

        // On récupère la notification pour retirer les demandes de covoiturages refusées
        const modifierNotification = await Notification.findById(req.body.id);

        // On va modifier les demandes de covoiturage pour indiquer qu'elles ont été refusées
        for(demandeRefusee of demandesRefusees){
            const refusDemandeCovoiturage = await DemandeCovoiturage.findById(demandeRefusee);

            // On indique que la demande de covoiturage est refusée, validée et la date du refus
            refusDemandeCovoiturage.acceptee = false,
            refusDemandeCovoiturage.validee = true,
            refusDemandeCovoiturage.date_accord_ou_refus = Date.now();
            
            await refusDemandeCovoiturage.save();

            // On retire la demande de covoiturage refusées de l'ancienne notification (celle de la demande de covoiturage)
            await modifierNotification.demandes_covoit.pull(demandeRefusee);
            // Et on l'insère dans le champ demandes_covoit_refusées
            await modifierNotification.demandes_covoit_refusees.push(demandeRefusee);

            await modifierNotification.save();
            
            // On enregistre les demandes refusées dans la notification des refus:
            await notification.demandes_covoit_refusees.push(demandeRefusee);
        }

        await notification.save();

        res.json(notification);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

router.post("/motif-refus/oui", auth, async function(req, res){
    try{
        // :id est l'id de la notification
        // :nbre_refus est le nombre de demandes de covoiturage refusées

        if(!req.body.motifsRefus){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer un motif" });
        }

        if(req.body.motifsRefus === 'autre' && !req.body.motifsPersonnalise){
            return res
                .status(400)
                .send({ msg: "Veuillez écrire votre motif dans le champs dédié" });
        }

        // Comme il se peut peut que le membre refus une par une les demandes ou par groupe, on a besoin d'indiquer le motif sur
        // celle(s) qui vient(nent) d'être refusée(s). Pour les trouver, comme il y a une date de refus dans la demande de 
        // covoiturage et qu'on sait combien on été refusées en même temps (req.body.nbre_refus) on va classer les résultats de 
        // la plus récemment refusée à la plus ancienne et prendre les req.body.nbre_refus premières

        // On récupère la notification dans laquelle les demandes refusées on été mises dans l'array demandes_covoit_refusées
        const notification = await Notification.findById(req.body.id);

        // Pour ce que j'ai vu, mongoose a un bug pour le sort() d'éléments dans un populate, on récupère donc toutes les 
        // demandes grâce à notification.demandes_covoit_refusees et on les trie par date
        const demandesRefusees = await DemandeCovoiturage.find({_id: { $in: notification.demandes_covoit_refusees}})
                                                            .sort({ date_accord_ou_refus: -1 })
                                                            .limit(req.body.nbre_refus*1); // *1 pour que req.body.nbre_refus soit considéré comme un nombre

        if(req.body.motifsRefus !== "autre"){
            for(demandeRefusee of demandesRefusees){
                demandeRefusee.motif_refus = req.body.motifsRefus;
                await demandeRefusee.save();
            }
        }

        if(req.body.motifsRefus === "autre"){
            for(demandeRefusee of demandesRefusees){
                demandeRefusee.motif_refus = req.body.motifsPersonnalise;
                await demandeRefusee.save();
            }
        }
        res.json(demandesRefusees);

    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

router.post("/motif-refus/non", auth, async function(req, res){
    try{
        // :id est l'id de la notification
        // :nbre_refus est le nombre de demandes de covoiturage refusées

        // Comme il se peut peut que le membre refus une par une les demandes ou par groupe, on a besoin d'indiquer le motif sur
        // celle(s) qui vient(nent) d'être refusée(s). Pour les trouver, comme il y a une date de refus dans la demande de 
        // covoiturage et qu'on sait combien on été refusées en même temps (req.body.nbre_refus) on va classer les résultats de 
        // la plus récemment refusée à la plus ancienne et prendre les req.body.nbre_refus premières

        // On récupère la notification dans laquelle les demandes refusées on été mises dans l'array demandes_covoit_refusées
        const notification = await Notification.findById(req.body.id);

        // Pour ce que j'ai vu, mongoose a un bug pour le sort() d'éléments dans un populate, on récupère donc toutes les 
        // demandes grâce à notification.demandes_covoit_refusees et on les trie par date
        const demandesRefusees = await DemandeCovoiturage.find({_id: { $in: notification.demandes_covoit_refusees}})
                                                            .sort({ date_accord_ou_refus: -1 })
                                                            .limit(req.body.nbre_refus*1); // *1 pour que req.body.nbre_refus soit considéré comme un nombre

        for(demandeRefusee of demandesRefusees){
            demandeRefusee.motif_refus = "ne se prononce pas";
            await demandeRefusee.save();
        }

        res.json(demandesRefusees);
    } catch(err){
        return res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer toutes les demandes de covoiturage
router.get("/admin/afficher/toutes", adminAuth, async function(req, res){
    try{
        const toutesLesDemandes = await DemandeCovoiturage.find()
                                                            .populate('trajets_aller')
                                                            .populate('trajets_retour');
        res.json(toutesLesDemandes);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher toutes les demandes de covoiturage acceptées
router.get("/admin/afficher/acceptees", adminAuth, async function(req, res){
    try{
        const demandesAcceptees = await DemandeCovoiturage.find({ acceptee: true })
                                                            .populate('trajets_aller')
                                                            .populate('trajets_retour');
                                                            // .sort({ date_demande: -1});
        
        res.json(demandesAcceptees);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher toutes les demandes de covoiturage refusées
router.get("/admin/afficher/refusees", adminAuth, async function(req, res){
    try{
        const demandesRefusees = await DemandeCovoiturage.find({ acceptee: false })
                                                            .populate('trajets_aller')
                                                            .populate('trajets_retour');
        res.json(demandesRefusees);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher toutes les demandes de covoiturage annulées
router.get("/admin/afficher/annulees", adminAuth, async function(req, res){
    try{
        const demandesAnnulees = await DemandeCovoiturage.find({ annulee: true })
                                                            .populate('trajets_aller')
                                                            .populate('trajets_retour');
        res.json(demandesAnnulees);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher les demandes de covoiturage en cours
router.get("/admin/afficher/en-cours", adminAuth, async function(req, res){
    try{

        const demandesEnCours = await DemandeCovoiturage.find({ $and: [ { annulee: false }, { validee: false } ] } )
                                                        .populate('trajets_aller')
                                                        .populate('trajets_retour');
        res.json(demandesEnCours);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;