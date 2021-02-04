const router = require('express').Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const MyArraySortByDayOfWeek = require('../middleware/classerParJour/sortArrayByDayOfWeek'); // Permet de trier par jour de la semaines ce qui est envoyé par les chechboxs
const MyObjectSortByDayOfWeek = require('../middleware/classerParJour/sortObjectByDayOfWeek');
const Membre = require('../models/membreModel');
const TrajetRetour = require('../models/trajetRetourModel');
const Depart = require('../models/menuDeroulant/departModel');
const Destination = require('../models/menuDeroulant/destinationModel');
const DemandeCovoiturage = require("../models/covoiturageDemandeModel");

router.post("/creer/:id", auth, async function(req, res){

    try{
        
        // Permet de récupérer le role. Si le membre est passager exclusif, il n'a pas à indiquer un nombre de places disponibles
        const recupererMembre = await Membre.findById(req.params.id);

        // le console.log de req.body donne un résultat de type: { checkItems: { trajet_id: true ou false } }
        // true si le membre coche la checkbox et false s'il la coche puis la décoche
        // Comme seuls les trues nous intéresse, on va sotocker les key(trajet_id) des valeurs === true dans la variable suivante:
        var joursProposes = [];

        // On parcourt l'objet pour récupérer toutes les keys qui ont une valeur true pour les stocker dans l'array joursProposes
        for(const [key, value] of Object.entries(req.body.checkItems)){
            if(value === true){
                joursProposes = joursProposes.concat(key);
            }
        }

        // Au cas où le membre ne coche pas les cases dans les jours de la semaine et parce que même s'il est possible de trier
        // dans un populate, le tri ne se fait que par ordre alphabétique ou croissant, ce qui empêche de classer par ordre des
        // jours de la semaines dans le populate. On trie dès maintenant par jours afin de ne plus avoir ce problème
        MyArraySortByDayOfWeek(joursProposes);

        // Validations:
        if(!req.body.checkItems ||
            !req.body.depart ||
            !req.body.heures_de_depart ||
            !req.body.minutes_de_depart ||
            !req.body.destination ||
            (!req.body.nombre_de_places && recupererMembre.role !== "Je suis passager exclusif")){ // Cette ligne permet de ne pas bloquer si le mebre est passager exclusif et n'a donc pas besoin de fixer un nombre de places
                return res
                    .status(400)
                    .send({ msg: "Tous les champs doivent être remplis" });
        }
        if(joursProposes.length === 0){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner un ou plusieurs trajets "});
        }
        if(req.body.depart === '------------------'){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner une zone de départ" });
        }
        if(req.body.heures_de_depart > 23 || req.body.heures_de_depart < 0){
            return res
                .status(400)
                .send(({ msg: "L'heure est comprise entre 0 et 23" }));
        }
        if(req.body.minutes_de_depart > 59 || req.body.minutes_de_depart < 0){
            return res
                .status(400)
                .send({ msg: "Les minutes doivent être comprises entre 0 et 59" });
        }
        if(req.body.destination === "------------------"){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner une zone d'arrivée" });
        }
        if(req.body.nombre_de_places < 0){
            return res
                .status(400)
                .send({ msg: "Le nombre de places dans le véhicule ne peut pas être inférieur à zéro" });
        }

        // Validation vérifiée uniquement quand le membre créé un nouveau trajet après son inscription
        if(req.body.nouveauTrajet){
            // S'il existe, cela veut dire qu'il ne s'agit pas d'une création de trajet lors de l'inscription)
            for(let jour of joursProposes){
                // On vérifie si le membre ne veut pas créer un trajet aller qui existe déjà pour un jour)
                const dejàTrajetPourCeJour = await TrajetRetour.find({ $and: [ { jour: jour }, { membre_id: req.params.id } ] } );
                
                if(dejàTrajetPourCeJour.length){
                    return res
                    .status(400)
                    .send({ msg: "Vous avez déjà un trajet retour pour le " + jour.toLowerCase() } );
                }
            }
        }

        // Pour que l'utilisateur indique le quartier s'il choisi une zone qui en possède un
        if(req.body.depart){
            const quartierPourCeDepart = await Destination.findOne({ nom: req.body.depart });
            if(quartierPourCeDepart.quartiers.length !== 0 && !req.body.quartierDepartData){
                return res
                    .status(400)
                    .send({ msg: "Indiquez la zone pour " + req.body.depart})
            }
        }

        if(req.body.destination){
            const quartierPourCetteDestination = await Depart.findOne({ nom: req.body.destination });
            if(quartierPourCetteDestination.quartiers.length !== 0 && !req.body.quartierDestinationData){
                return res
                    .status(400)
                    .send({ msg: "Indiquez la zone pour " + req.body.destination})
            }
        }

        // on soustrait 0 à req.body.minutes_de_depart car node le considère comme une string et fait une concaténation. Comme on ne peut soustraire une string, il comprend qu'il s'agit d'un int (pareil avec la multipilication par 60)
        const heureEnMinutes = req.body.heures_de_depart*60 + (req.body.minutes_de_depart - 0);
        const heureEnString = req.body.heures_de_depart + "h" + req.body.minutes_de_depart;

        const onDecoupePourInsererParJourDeTrajet = async function(){
            // Si je n'utilise pas le .then(), le res.json est envoyé plusieurs fois et créé une erreur et empêche l'enregistrement
            // de plus de 2 trajets. J'incrémente une variable (commme pour une boucle for classique) pour que le res.json ne soit
            // envoyé qu'une fois que j'ai parcouru toute l'array des jours choisis par le membre pour les trajets
            let finDeLaBoucle = 0;

            for(let jour of joursProposes){

                let retour = new TrajetRetour({
                    prenom: req.body.prenom,
                    membre_id: req.body.id,
                    jour: jour,
                    depart: req.body.depart,
                    depart_quartier: req.body.quartierDepartData,
                    heure_de_depart_en_string: heureEnString,
                    heure_depart_en_minutes: heureEnMinutes,
                    depart_heures: req.body.heures_de_depart,
                    depart_minutes: req.body.minutes_de_depart,
                    destination: req.body.destination,
                    destination_quartier: req.body.quartierDestinationData,
                    nombre_de_places: req.body.nombre_de_places,
                    nombre_de_places_total: req.body.nombre_de_places
                });

                const nouveauRetour = await retour.save()
                await Membre.findById(req.params.id, (err, membre) => {
                    if(membre){
                        membre.trajets_retour.push(retour.id);
                        membre.save();
                        finDeLaBoucle += 1;
                        // Si on arrive à la fin de la boucle on envoi le json. Cela permet au history.push de React de fonctionner
                        if(finDeLaBoucle === joursProposes.length){
                            res.json(nouveauRetour);
                        }
                    }
                });
            }
        }
        onDecoupePourInsererParJourDeTrajet();

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

// Permet d'afficher un trajet retour
router.get("/afficher-un/:id", async function(req, res){
    try{

        const afficherUnTrajetRetour = await TrajetRetour.findById(req.params.id);
        res.json(afficherUnTrajetRetour);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

// Permet d'afficher les trajets retour d'un membre
router.get("/afficher/:id", auth, async function(req, res){
    try{

        const afficherTrajetRetourDuMembre = await TrajetRetour.find({ membre_id: req.params.id });

        if(afficherTrajetRetourDuMembre.length === 0){
            res.json("Queud")
        } else {
            // On trie les résultats par jour
            MyObjectSortByDayOfWeek(afficherTrajetRetourDuMembre);
            res.json(afficherTrajetRetourDuMembre);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les jours de trajets pour l'affichage du matching
router.get("/afficher-pour-matching/:id", auth, async function(req, res){
    try{

        const trajetsPourAfficherMatchingEnTableau = await TrajetRetour.find({ $and: [ 
            { membre_id: req.params.id },
            { passager_sur_autre_trajet: false },
            { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] },
        ]});

        MyObjectSortByDayOfWeek(trajetsPourAfficherMatchingEnTableau);
        
        res.json(trajetsPourAfficherMatchingEnTableau);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de modifier un trajet retour
router.put("/maj/:id", auth, async function(req, res){
    try{

        //Validations
        if(req.body.depart === 'Choisissez votre zone de départ'){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner une zone de départ" });
        }
        if(req.body.heures_de_depart > 23 || req.body.heures_de_depart < 0){
            return res
                .status(400)
                .send(({ msg: "L'heure est comprise entre 0 et 23" }));
        }
        if(req.body.minutes_de_depart > 59 || req.body.minutes_de_depart < 0){
            return res
                .status(400)
                .send({ msg: "Les minutes doivent être comprises entre 0 et 59" });
        }
        if(req.body.destination === "Choisissez votre zone d'arrivée"){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner une zone d'arrivée" });
        }
        if(req.body.nombre_de_places < 0){
            return res
                .status(400)
                .send({ msg: "Le nombre de places dans le véhicule ne peut pas être inférieur à zéro" });
        }

        // On vérifie s'il existe des quartiers pour le départ selectionné afin que le membre le renseigne
        // Je fais la requête ici car à la place du if en ligne 288 car node n'acceptait pas le await
        if(req.body.depart){
            const quartierPourCeDepart = await Destination.findOne({ nom: req.body.depart });
            if(quartierPourCeDepart.quartiers.length !== 0 && !req.body.quartierDepartData){
                return res
                    .status(400)
                    .send({ msg: "Indiquez la zone pour " + req.body.depart})
            }
        }
        // On vérifie s'il existe des quartiers pour le départ selectionné afin que le membre le renseigne
        // Je fais la requête ici car à la place du if en ligne 318 car node n'acceptait pas le await
        if(req.body.destination){
            const quartierPourCetteDestination = await Depart.findOne({ nom: req.body.destination });
            if(quartierPourCetteDestination.quartiers.length !== 0 && !req.body.quartierDestinationData){
                return res
                    .status(400)
                    .send({ msg: "Indiquez la zone pour " + req.body.destination})
            }
        }

        const modifierUnTrajetRetour = await TrajetRetour.findById(req.params.id, function(err, trajetRetour){
            if(!trajetRetour){
                return res
                    .status(400)
                    .send({ msg: "Trajet retour non trouvé" });
            } else if(trajetRetour.passager_sur_autre_trajet === true){
                return res
                    .status(400)
                    .send({ msg: "Vous êtes passager sur ce trajet, vous devez quitter ce covoiturage avant de le modifier"});
            } else if(trajetRetour.conducteur_sur_ce_trajet === true &&
                (req.body.checkItems ||
                req.body.depart || 
                req.body.heures_de_depart ||
                req.body.minutes_de_depart ||
                req.body.destination)){
                // Les conditions supplémentaire permet de modifier uniquement le nombre de places disponibles 
                // quand il y a un covoiturage
                    return res
                        .status(400)
                        .send({ msg: "Vous êtes conducteur sur ce trajet, vous devez quitter ce covoiturage avant de modifier autre chose que le nombre de places disponibles"});
            } else { // Les if qui suivent permet au membre de modifier un ou plusieurs champs
                if(req.body.depart){
                    trajetRetour.depart = req.body.depart;
                    if(trajetRetour.depart_quartier){
                        // Si on modifie le départ, on supprime le champs depart_quartier du trajet retour
                        trajetRetour.depart_quartier = undefined;
                    }
                }
                if(req.body.quartierDepartData){trajetRetour.depart_quartier = req.body.quartierDepartData}
                if(req.body.heures_de_depart && req.body.minutes_de_depart){
                    const heureEnMinutes = req.body.heures_de_depart*60 + (req.body.minutes_de_depart - 0); // on soustrait 0 à req.body.minutes_de_depart car node le considère comme une string et fait une concaténation. Comme on ne peut soustraire une string, il comprend qu'il s'agit d'un int (pareil avec la multipilication par 60)
                    const heureEnString = req.body.heures_de_depart + "h" + req.body.minutes_de_depart;
                    trajetRetour.heure_de_depart_en_string = heureEnString;
                    trajetRetour.heure_depart_en_minutes = heureEnMinutes;
                    trajetRetour.depart_heures = req.body.heures_de_depart;
                    trajetRetour.depart_minutes = req.body.minutes_de_depart;
                }
                if(req.body.heures_de_depart){
                    const heureEnMinutes = req.body.heures_de_depart*60 + (trajetRetour.depart_minutes - 0); // on soustrait 0 à req.body.minutes_de_depart car node le considère comme une string et fait une concaténation. Comme on ne peut soustraire une string, il comprend qu'il s'agit d'un int (pareil avec la multipilication par 60)
                    const heureEnString = req.body.heures_de_depart + "h" + trajetRetour.depart_minutes;
                    trajetRetour.heure_de_depart_en_string = heureEnString;
                    trajetRetour.heure_depart_en_minutes = heureEnMinutes;
                    trajetRetour.depart_heures = req.body.heures_de_depart;
                }
                if(req.body.minutes_de_depart){
                    const heureEnMinutes = trajetRetour.depart_heures*60 + (req.body.minutes_de_depart - 0); // on soustrait 0 à req.body.minutes_de_depart car node le considère comme une string et fait une concaténation. Comme on ne peut soustraire une string, il comprend qu'il s'agit d'un int (pareil avec la multipilication par 60)
                    const heureEnString = trajetRetour.depart_heures + "h" + req.body.minutes_de_depart;
                    trajetRetour.heure_de_depart_en_string = heureEnString;
                    trajetRetour.heure_depart_en_minutes = heureEnMinutes;
                    trajetRetour.depart_minutes = req.body.minutes_de_depart
                }
                if(req.body.destination){
                    trajetRetour.destination = req.body.destination;
                    if(trajetRetour.destination_quartier){
                        // Si on modifie la destination, on supprime le champs destination_quartier du trajet retour
                        trajetRetour.destination_quartier = undefined;
                    }
                }
                if(req.body.quartierDestinationData){trajetRetour.destination_quartier = req.body.quartierDestinationData}
                if(req.body.nombre_de_places){
                    if(trajetRetour.nombre_de_places_total){
                        let nombre_de_places_en_moins = trajetRetour.nombre_de_places_total*1 - trajetRetour.nombre_de_places;
                        trajetRetour.nombre_de_places_total = req.body.nombre_de_places;
                        trajetRetour.nombre_de_places = req.body.nombre_de_places*1 - nombre_de_places_en_moins;
                        if(req.body.nombre_de_places*1 - nombre_de_places_en_moins < 0){
                            return res
                                .status(400)
                                .send({ msg: "Vous ne pouvez pas avoir un nombre de places disponible inférieur à zéro"});
                        }
                    } else {
                        // S'il n'y avait pas de nombre de place à la base (car le membre était passager exclusuf), on enregistre
                        // tout simplement les places
                        trajetRetour.nombre_de_places_total = req.body.nombre_de_places;
                        trajetRetour.nombre_de_places = req.body.nombre_de_places;
                    }
                }

                trajetRetour.save();
                res.json(trajetRetour);
            }
        })

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

// Route pour supprimer des trajets. C'est un post et pas un delete car on envoie les trajets à supprimer par les checkboxs
router.post("/supprimer/:id", auth, async function(req, res){
    try{
        
        // le console.log de req.body donne un résultat de type: { checkItems: { trajet_id: true ou false } }
        // true si le membre coche la checkbox et false s'il la coche puis la décoche
        // Comme seuls les trues nous intéresse, on va sotocker les key(trajet_id) des valeurs === true dans la variable suivante:
        var trajetsSelectionnes = [];

        // On parcourt l'objet pour récupérer toutes les keys qui ont une valeur true pour les stocker dans l'array trajetsSelectionnes
        for(const [key, value] of Object.entries(req.body.checkItems)){
            if(value === true){
                trajetsSelectionnes = trajetsSelectionnes.concat(key);
            }
        }

        if(trajetsSelectionnes.length === 0){
            return res
                .status(400)
                .send({ msg: "Veuillez selectionner un ou plusieurs trajets"});
        }

        // On prend l'id d'un trajet pour récupérer le membre titulaire du trajet afin de retirer le ou les trajets supprimé(s)
        // du profil du membre
        const membreQuiSupprime = await Membre.findOne({ trajets_retour: { $in: trajetsSelectionnes[0] } } );

        // On va d'abord parcourir les trajets selectionner pour vérifier que le membre ne supprime pas ceux pour 
        // lesquels il y a un covoiturages
        for(jePeuxSupprimer of trajetsSelectionnes){

            const supprimerCeTrajet = await TrajetRetour.findById(jePeuxSupprimer);

            if(supprimerCeTrajet.passager_sur_autre_trajet === true){
                return res
                    .status(400)
                    .send({ msg: "Vous êtes passager sur le trajet du " + supprimerCeTrajet.jour.toLowerCase() + " vous devez quitter ce covoiturage avant de le supprimer"});
            }

            if(supprimerCeTrajet.conducteur_sur_ce_trajet === true){
                return res
                    .status(400)
                    .send({ msg: "Vous êtes conducteur sur le trajet du " + supprimerCeTrajet.jour.toLowerCase() + " vous devez arrêter ce covoiturage avant de le supprimer"});
            }
        }

        // On vérifie aussi qu'il n'y a pas reçu de demande de covoiturage en cours sur le(s) trajet(s) retour qu'il souhaite supprimer
        for(demandeCovoitRecue of trajetsSelectionnes){

            const jePeuxSupprimerCeTrajet = await DemandeCovoiturage.findOne({ $and : [ { trajets_retour: { $in: demandeCovoitRecue } },
                                                                                        { validee: false },
                                                                                        { annulee: false } ] } )
                                                                    .populate("trajets_retour");

            if(jePeuxSupprimerCeTrajet){
                return res
                    .status(400)
                    .send({ msg: "Vous avez reçu une demande de covoiturage en cours pour le trajet du " + jePeuxSupprimerCeTrajet.trajets_retour[0].jour.toLowerCase() + ", vous ne pouvez pas le supprimer"});
            }
        }

        // On vérifie maintenant qu'il n'a fait de demande de covoiturage pour ce trajet
        for(demandeCovoitEnvoyee of trajetsSelectionnes){
            
            // On récupère la totalité du trajet qu'il souhaite supprimer pour récupérer le jour du trajet
            const trajetASupprimer = await TrajetRetour.findById(demandeCovoitEnvoyee);

            // On recherche les demandes de covoiturage qu'il a fait et qui est en cours
            const demandeCovoitAvecTrajet = await DemandeCovoiturage.find({ $and: [ { demandeur_id: trajetASupprimer.membre_id },
                                                                                    { aller_ou_retour: "retour" },
                                                                                    { validee: false }, 
                                                                                    { annulee: false } ] } )
                                                                    .populate("trajets_retour");

            for(trouverLeMemeJour of demandeCovoitAvecTrajet){
                if(trajetASupprimer.jour === trouverLeMemeJour.trajets_retour[0].jour){
                    return res
                        .status(400)
                        .send({ msg: "Vous avez fait une demande de covoiturage qui est en cours pour le " + trouverLeMemeJour.trajets_retour[0].jour.toLowerCase() + ", vous ne pouvez pas le supprimer"})
                }
            }
        }

        // Maintenant que l'on sait qu'il n'y a aucun covoiturage poir les trajets sélectionnés, on peux les supprimer
        for(supprimerTrajet of trajetsSelectionnes){
            // On retire le trajet supprimé du profil membre
            membreQuiSupprime.trajets_retour.pull(supprimerTrajet);
            await membreQuiSupprime.save();

            await TrajetRetour.findByIdAndDelete(supprimerTrajet);
        }
        res.json("OK");

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer tous les trajets retour
router.get("/afficher-tous", adminAuth, async function(req, res){
    try{

        const affichezLesTous = await TrajetRetour.find();

        // On trie par heure de trajet
        // On commence par trier l'array d'objets par heure de départ
        affichezLesTous.sort(function sortByTime(a, b) {
            let heure1 = a.heure_de_depart_en_string;
            let heure2 = b.heure_de_depart_en_string;

            let comparison = 0;
            if(heure1 > heure2){
                comparison = 1;
            } else if(heure1 < heure2){
                comparison = -1;
            }
            return comparison;
        });
        // On les trie par jour de la semaine
        MyObjectSortByDayOfWeek(affichezLesTous);

        res.json(affichezLesTous);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les trajets retour qui ont un équipage
router.get("/conducteurs", adminAuth, async function(req, res){
    try{

        const trajetsRetourAvecEquipage = await TrajetRetour.find({ conducteur_sur_ce_trajet: true });

        // On trie par heure de trajet
        // On commence par trier l'array d'objets par heure de départ
        trajetsRetourAvecEquipage.sort(function sortByTime(a, b) {
            let heure1 = a.heure_de_depart_en_string;
            let heure2 = b.heure_de_depart_en_string;

            let comparison = 0;
            if(heure1 > heure2){
                comparison = 1;
            } else if(heure1 < heure2){
                comparison = -1;
            }
            return comparison;
        });
        // On les trie par jour de la semaine
        MyObjectSortByDayOfWeek(trajetsRetourAvecEquipage);
        
        res.json(trajetsRetourAvecEquipage);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les trajets retour pour lesquels le membre a trouvé un conducteur
router.get("/passagers", adminAuth, async function(req, res){
    try{

        const trajetsRetourTrouveConducteur = await TrajetRetour.find({ passager_sur_autre_trajet: true });

        // On trie par heure de trajet
        // On commence par trier l'array d'objets par heure de départ
        trajetsRetourTrouveConducteur.sort(function sortByTime(a, b) {
            let heure1 = a.heure_de_depart_en_string;
            let heure2 = b.heure_de_depart_en_string;

            let comparison = 0;
            if(heure1 > heure2){
                comparison = 1;
            } else if(heure1 < heure2){
                comparison = -1;
            }
            return comparison;
        });
        // On les trie par jour de la semaine
        MyObjectSortByDayOfWeek(trajetsRetourTrouveConducteur);
        
        res.json(trajetsRetourTrouveConducteur);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les trajets retour pour lesquels il n'y a pas de covoiturage
router.get("/sans-covoiturage", adminAuth, async function(req, res){
    try{

        const trajetsRetourSansCovoiturage = await TrajetRetour.find({ $and: [ { passager_sur_autre_trajet: false },
                                                                              { conducteur_sur_ce_trajet: false } ] } );

        // On trie par heure de trajet
        // On commence par trier l'array d'objets par heure de départ
        trajetsRetourSansCovoiturage.sort(function sortByTime(a, b) {
            let heure1 = a.heure_de_depart_en_string;
            let heure2 = b.heure_de_depart_en_string;

            let comparison = 0;
            if(heure1 > heure2){
                comparison = 1;
            } else if(heure1 < heure2){
                comparison = -1;
            }
            return comparison;
        });
        // On les trie par jour de la semaine
        MyObjectSortByDayOfWeek(trajetsRetourSansCovoiturage);
        
        res.json(trajetsRetourSansCovoiturage);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});



// Permet de récupérer le nombre de trajets retour ayant la même zone de départ
router.get("/depart/nombre", adminAuth, async function(req, res){
    try{

        // On récupère d'abord tous les départs qui sont les destinations pour les retours
        const tousLesDeparts = await Destination.find().sort({ nom: 1 });

        // On créé une array qui va contenir tous les objets
        let result = [];

        for(unDepart of tousLesDeparts){
            const nombre = await TrajetRetour.find({ depart: unDepart.nom});

            // On créé un objet dans lequel on stock les données
            const nombreParDepart = {
                depart: unDepart.nom,
                nombre: nombre.length
            }
            // On les regroupe dans l'array
            result = result.concat(nombreParDepart);
        }

        res.json(result);

    } catch(err){
        res.status(500).json({ error: err.message}); 
    }
});

// Permet de trouver tous les trajets aller avec le même départ
router.get("/depart/tous/:nom", adminAuth, async function(req, res){
    try{

        const trajetRetourAvecDepart = await TrajetRetour.find({ depart: req.params.nom});

        if(trajetRetourAvecDepart.length === 0){
            res.json("Queud");
        } else{
            // On trie par heure de trajet
            // On commence par trier l'array d'objets par heure de départ
            trajetRetourAvecDepart.sort(function sortByTime(a, b) {
                let heure1 = a.heure_de_depart_en_string;
                let heure2 = b.heure_de_depart_en_string;

                let comparison = 0;
                if(heure1 > heure2){
                    comparison = 1;
                } else if(heure1 < heure2){
                    comparison = -1;
                }
                return comparison;
            });
            // On les trie par jour de la semaine
            MyObjectSortByDayOfWeek(trajetRetourAvecDepart);
            res.json(trajetRetourAvecDepart);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer le nombre de trajets retour ayant la même zone de destination
router.get("/destination/nombre", adminAuth, async function(req, res){
    try{

        // On récupère d'abord toutes les destination qui sont les départs pour les retours
        const toutesLesDestinations = await Depart.find().sort({ nom: 1 });

        // On créé une array qui va contenir tous les objets
        let result = [];

        for(uneDestination of toutesLesDestinations){
            const nombre = await TrajetRetour.find({ destination: uneDestination.nom});

            // On créé un objet dans lequel on stock les données
            const nombreParDestination = {
                destination: uneDestination.nom,
                nombre: nombre.length
            }
            // On les regroupe dans l'array
            result = result.concat(nombreParDestination);
        }

        res.json(result);

    } catch(err){
        res.status(500).json({ error: err.message}); 
    }
});

// Permet de trouver tous les trajets retour avec la même destination
router.get("/destination/tous/:nom", adminAuth, async function(req, res){
    try{

        const trajetRetourAvecDestination = await TrajetRetour.find({ destination: req.params.nom});

        if(trajetRetourAvecDestination.length === 0){
            res.json("Queud");
        } else{
            // On trie par heure de trajet
            // On commence par trier l'array d'objets par heure de départ
            trajetRetourAvecDestination.sort(function sortByTime(a, b) {
                let heure1 = a.heure_de_depart_en_string;
                let heure2 = b.heure_de_depart_en_string;

                let comparison = 0;
                if(heure1 > heure2){
                    comparison = 1;
                } else if(heure1 < heure2){
                    comparison = -1;
                }
                return comparison;
            });
            // On les trie par jour de la semaine
            MyObjectSortByDayOfWeek(trajetRetourAvecDestination);
            res.json(trajetRetourAvecDestination);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;