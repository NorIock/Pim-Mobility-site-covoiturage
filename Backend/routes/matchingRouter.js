const router = require('express').Router();
const auth = require('../middleware/auth');
const Membre = require('../models/membreModel');
const TrajetAller = require('../models/trajetAllerModel');
const TrajetRetour = require('../models/trajetRetourModel');
const MyObjectSortByDayOfWeek = require('../middleware/classerParJour/sortObjectByDayOfWeek');

router.get('/trouver/aller/:id', auth, async function(req, res){ // Matching des trajets aller
    try{
        // Variable dans laquelle on stockera le rôle pour la recherche des membres à parcourir
        let roleResearchField = "";

        // Variable dans laquelle le resultat du matching sera stocké
        let result = [];
        
        // Je récupère les données de la personne qui cherche un matching
        const monProfil = await Membre.findById(req.params.id).populate('trajets_aller');

        if(monProfil.role === undefined){ // En premier car si le role n'est pas défini, cela bloque la requête et aucun affichage dans le front

            return res.json(result); // On renvoie donc directement un array vide

        } else if(monProfil.role.includes("passager") && !monProfil.role.includes("conducteur")) {

            roleResearchField = "conducteur"; // Comme le membre qui recherche son match est uniquement passager, on ne recherche que ceux qui conduisent

        } else if(monProfil.role.includes("conducteur") && !monProfil.role.includes("passager")){

            roleResearchField = "passager"; // Comme le membre qui recherche son match est uniquement conducteur, on ne recherche que ceux qui sont passagers
        
        } else if(monProfil.role.includes("passager") && monProfil.role.includes("conducteur")){

            console.log("passager et conducteur"); // Comme la string roleResearchField est déjà vide (""), le regex cherchera tout

        }
        
        // On récupère les membres avec un rôle qui correspond avec celui qui recherche en retirant le profil du membre et ceux qui sont indisponible
        const membresAvecRoleQuiCorrespond = await Membre.find( { $and: [ { _id: { $ne: monProfil._id } }, // Comme on fait une recherche pour tous les membres, on évite d'afficher son propre profile (quand on est conducteur et passager)
                                                                          { role: { $regex: roleResearchField} },
                                                                          { indisponible: { $ne: true } }
                                                                        ] } );

        // Partir des membres dont le rôle correspond, on parcours le résultats pour chercher parmi leur trajets les matchs possibles
        for(j = 0; j < membresAvecRoleQuiCorrespond.length; j++)
        {
            // Une boucle pour effectuer la recherche pour chaque journée
            for(i = 0; i < monProfil.trajets_aller.length; i++)
            {
                // Si le membre est conducteur exclusif ou conducteur sur le trajet, on va exclure tous les hybrides
                // qui sont conducteur pour un trajet
                if((roleResearchField === "passager" || monProfil.trajets_aller[i].conducteur_sur_ce_trajet === true) &&
                    monProfil.trajets_aller[i].nombre_de_places > 0){
                    const research = await TrajetAller.find( { $and: [ { membre_id: membresAvecRoleQuiCorrespond[j]._id }, 
                                                                    { jour: monProfil.trajets_aller[i].jour },
                                                                    { depart: monProfil.trajets_aller[i].depart },
                                                                    { destination: monProfil.trajets_aller[i].destination },
                                                                    { heure_depart_en_minutes: { $gte: monProfil.trajets_aller[i].heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                 $lte: monProfil.trajets_aller[i].heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                    { passager_sur_autre_trajet: false },
                                                                    { conducteur_sur_ce_trajet: false },
                                                                    ]
                                                                } );
                    result = result.concat(research); // Regroupe les résultats en un seul array 
                }

                // si monProfil.trajets_aller[i].passager_sur_autre_trajet === true
                // Dans ce cas de figure, le covoiturage est trouvé pour ce jour, il n'est pas nécessaire de faire un matching

                // On va donc faire la recherche dans le cas où passager_sur_autre_trajet et conducteur_sur_ce_trajet sont false
                // afin d'exlure de la recherche les jours pour lequel il est déjà passager. On exclu aussi de cette recherche
                // les conducteurs exclusifs
                if(monProfil.trajets_aller[i].passager_sur_autre_trajet === false && 
                    monProfil.trajets_aller[i].conducteur_sur_ce_trajet === false &&
                    roleResearchField !== "passager"){
                    const research = await TrajetAller.find( { $and: [ { membre_id: membresAvecRoleQuiCorrespond[j]._id }, 
                                                                    { jour: monProfil.trajets_aller[i].jour },
                                                                    { depart: monProfil.trajets_aller[i].depart },
                                                                    { destination: monProfil.trajets_aller[i].destination },
                                                                    { heure_depart_en_minutes: { $gte: monProfil.trajets_aller[i].heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                 $lte: monProfil.trajets_aller[i].heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                    { passager_sur_autre_trajet: false },
                                                                    { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] },
                                                                    ]
                                                                } );
                    result = result.concat(research); // Regroupe les résultats en un seul array 
                }
            }
        }
         
        // On commence par trier l'array d'objets par heure de départ
        result.sort(function sortByTime(a, b) {
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

        // Puis on trie par jour
        MyObjectSortByDayOfWeek(result);
        
        res.json(result);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.get('/trouver/retour/:id', auth, async function(req, res){ // Matching des trajets retour
    try{
        // Variable dans laquelle on stochera le rôle pour la recherche des membres à parcourir
        let roleResearchField = "";

        // Variable dans laquelle le resultat sera stocké
        let result = [];
        
        // Je récupère les données de la personne qui cherche un matching
        const monProfil = await Membre.findById(req.params.id).populate('trajets_retour');

        if(monProfil.role === undefined){ // En premier car si le role n'est pas défini, cela bloque la requête et aucun affichage dans le front

            return res.json(result); // On renvoie donc directement un array vide

        } else if(monProfil.role.includes("passager") && !monProfil.role.includes("conducteur")) {

            roleResearchField = "conducteur"; // Comme le membre qui recherche son match est uniquement passager, on ne recherche que ceux qui conduisent

        } else if(monProfil.role.includes("conducteur") && !monProfil.role.includes("passager")){

            roleResearchField = "passager"; // Comme le membre qui recherche son match est uniquement conducteur, on ne recherche que ceux qui sont passagers
        
        } else if(monProfil.role.includes("passager") && monProfil.role.includes("conducteur")){

            console.log("passager et conducteur"); // Comme la string roleResearchField est déjà vide (""), le regex cherchera tout

        }

        // On récupère les membres avec un rôle qui corresponds avec celui qui recherche en retirant le profil du membre et ceux qui sont indisponible
        const membresAvecRoleQuiCorrespond = await Membre.find( { $and: [ { _id: { $ne: monProfil._id } }, // Comme on fait une recherche pour tous les membres, on évite d'afficher son propre profile (quand on est conducteur et passager)
                                                                          { role: { $regex: roleResearchField} },
                                                                          { indisponible: { $ne: true } }
                                                                        ] } );


        // Partir des membres dont le rôle correspond, on parcours le résultats pour chercher parmi leur trajets les matchs possibles
        for(j = 0; j < membresAvecRoleQuiCorrespond.length; j++)
        {
            // Une boucle pour effectuer la recherche pour chaque journée
            for(i = 0; i < monProfil.trajets_retour.length; i++)
            {
                // Si le membre est conducteur exclusif ou conducteur sur le trajet, on va exclure tous les hybrides
                // qui sont conducteur pour un trajet
                if((roleResearchField === "passager" || monProfil.trajets_retour[i].conducteur_sur_ce_trajet === true) &&
                    monProfil.trajets_retour[i].nombre_de_places > 0){
                    const research = await TrajetRetour.find( { $and: [ { membre_id: membresAvecRoleQuiCorrespond[j]._id }, // Comme on parcourt tous les arrays, cela évite que l'on retrouve en résultat le membre qui fait la recherche
                                                                        { jour: monProfil.trajets_retour[i].jour },
                                                                        { depart: monProfil.trajets_retour[i].depart },
                                                                        { destination: monProfil.trajets_retour[i].destination },
                                                                        { heure_depart_en_minutes: { $gte: monProfil.trajets_retour[i].heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                    $lte: monProfil.trajets_retour[i].heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                        { passager_sur_autre_trajet: false },
                                                                        { conducteur_sur_ce_trajet: false },
                                                                    ]
                                                                } );
                    result = result.concat(research); // Regroupe les résultats en un seul array 
                }
                // si monProfil.trajets_aller[i].passager_sur_autre_trajet === true
                // Dans ce cas de figure, le covoiturage est trouvé pour ce jour, il n'est pas nécessaire de faire un matching

                // On va donc faire la recherche dans le cas où passager_sur_autre_trajet et conducteur_sur_ce_trajet sont false
                // afin d'exlure de la recherche les jours pour lequel il est déjà passager. On exclu aussi de cette recherche
                // les conducteurs exclusifs
                if(monProfil.trajets_retour[i].passager_sur_autre_trajet === false && 
                    monProfil.trajets_retour[i].conducteur_sur_ce_trajet === false &&
                    roleResearchField !== "passager"){
                    const research = await TrajetRetour.find( { $and: [ { membre_id: membresAvecRoleQuiCorrespond[j]._id }, // Comme on parcourt tous les arrays, cela évite que l'on retrouve en résultat le membre qui fait la recherche
                                                                        { jour: monProfil.trajets_retour[i].jour },
                                                                        { depart: monProfil.trajets_retour[i].depart },
                                                                        { destination: monProfil.trajets_retour[i].destination },
                                                                        { heure_depart_en_minutes: { $gte: monProfil.trajets_retour[i].heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                    $lte: monProfil.trajets_retour[i].heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                        { passager_sur_autre_trajet: false },
                                                                        { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] },
                                                                        ]
                                                                } );
                    result = result.concat(research); // Regroupe les résultats en un seul array 
                }
            }
        }

        // Comme on recherche d'abord les membres dont les rôles correspondent, le résultat est classé par membre. 
        // On commence par trier l'array d'objets par heure de départ
        result.sort(function sortByTime(a, b) {
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

        // Puis on trie par jour
        MyObjectSortByDayOfWeek(result);

        res.json(result);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les données de la personne matchée
router.get("/profil/:id", auth, async function(req, res){ //Afficher le profil de la personne matché
    try{
        const matchedProfil = await Membre.findById(req.params.id).populate("trajets_aller").populate("trajets_retour");
        res.json([matchedProfil]); // Il y a des crochets car l'API ne renvoyait qu'un objet, pas une array et le map ne fonctionnait pas

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les trajets aller compatibles quand on affiche le membre matché pour faire des demandes de covoiturages
router.get("/trajets/aller/:id/:membreId/:passagerOuConducteur", auth, async function(req, res){
    try{
        // :id: id de la personne matchée
        // :membreId: id de la personne qui fait le matching

        // Comme pour le matching, on récupère les trajets de la personnes qui recherche et on les classe par jour de la semaine
        // Uniquement les trajets pour lesquels on a pas trouvé de covoiturage ou on a encore de la place
        const mesTrajets = await TrajetAller.find({ $and: [ { membre_id: req.params.membreId },
                                                            { passager_sur_autre_trajet: false}, 
                                                            { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] } ] });
        // On trie par jour de semaine
        MyObjectSortByDayOfWeek(mesTrajets);

        // On récupère le role de la personne matché pour mieux chercher les trajets compatibles
        const membreMatche = await Membre.findById(req.params.id);

        // On créé une arrya dans laquelle on va stocker les résultats:
        let trajetsTrouves = [];

        // Si le membre matché est conducteur exclusif
        if(membreMatche.role === "Je suis conducteur exclusif"){
            for(unTrajet of mesTrajets){
                if(unTrajet.conducteur_sur_ce_trajet === false){
                    // On exclu de mesTrajets ceux pour lesquels le membre qui match est conducteur
                    const research = await TrajetAller.find({ $and: [ { membre_id: req.params.id },
                                                                      { jour: unTrajet.jour },
                                                                      { depart: unTrajet.depart },
                                                                      { destination: unTrajet.destination },
                                                                      { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                        $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                      { nombre_de_places: { $gte: 1 } }
                                                                    ]})
                    trajetsTrouves = trajetsTrouves.concat(research);
                }
            }
            if(trajetsTrouves.length === 0 ){
                res.json("Queud")
            } else {
                res.json(trajetsTrouves);                                                          
            }
        }

        // Si le membre matché est passager exclusif
        if(membreMatche.role === "Je suis passager exclusif"){
            for(unTrajet of mesTrajets){
                const research = await TrajetAller.find({ $and: [ { membre_id: req.params.id },
                                                                  { jour: unTrajet.jour },
                                                                  { depart: unTrajet.depart },
                                                                  { destination: unTrajet.destination },
                                                                  { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                               $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                  { passager_sur_autre_trajet: false },
                                                                ]})
                trajetsTrouves = trajetsTrouves.concat(research);
            }
            if(trajetsTrouves.length === 0 ){
                res.json("Queud")
            } else {
                res.json(trajetsTrouves);                                                          
            }
        }

        // Si le membre matché a un role hybride, dans chaque if qui suit on fera une recherche en fonction de req.params.passagerOuConducteur
        if(membreMatche.role !== "Je suis conducteur exclusif" && membreMatche.role !== "Je suis passager exclusif"){

            if(req.params.passagerOuConducteur === "Conducteur"){
                // Le membre fait une demande en tant que conducteur, il cherche donc un trajet passager
                for(unTrajet of mesTrajets){
                    const research = await TrajetAller.find({ $and: [ { membre_id: req.params.id },
                                                                      { jour: unTrajet.jour },
                                                                      { depart: unTrajet.depart },
                                                                      { destination: unTrajet.destination },
                                                                      { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                   $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                      { passager_sur_autre_trajet: false },
                                                                      { conducteur_sur_ce_trajet: false },
                                                                    //   { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] }
                                                                    ]})

                    trajetsTrouves = trajetsTrouves.concat(research);
                }
                res.json(trajetsTrouves);  
            }
            if(req.params.passagerOuConducteur === "Passager"){
                // Le membre fait une demande en tant que passager, il cherche donc un trajet conducteur
                for(unTrajet of mesTrajets){
                    if(unTrajet.conducteur_sur_ce_trajet === false){
                        // On exclu de mesTrajets ceux pour lesquels le membre qui match est conducteur
                        const research = await TrajetAller.find({ $and: [ { membre_id: req.params.id },
                                                                          { jour: unTrajet.jour },
                                                                          { depart: unTrajet.depart },
                                                                          { destination: unTrajet.destination },
                                                                          { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                       $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                          { passager_sur_autre_trajet: false },
                                                                          { nombre_de_places: { $gte: 1 } }
                                                                        ]})
    
                        trajetsTrouves = trajetsTrouves.concat(research);
                    }
                }
                res.json(trajetsTrouves); 
            }
            if(req.params.passagerOuConducteur !== "Conducteur" && req.params.passagerOuConducteur !== "Passager"){
                // Tous les trajets de membre matché qui corresondent aux critères (que ce soit passager ou conducteur)
            
                for(unTrajet of mesTrajets){
                    const research = await TrajetAller.find({ $and: [ { membre_id: req.params.id },
                                                                      { jour: unTrajet.jour },
                                                                      { depart: unTrajet.depart },
                                                                      { destination: unTrajet.destination },
                                                                      { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                   $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                      { passager_sur_autre_trajet: false },
                                                                      { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] }
                                                                    ]})

                    trajetsTrouves = trajetsTrouves.concat(research);
                }
                if(trajetsTrouves.length === 0 ){
                    res.json("Queud")
                } else {
                    res.json(trajetsTrouves);                                                          
                }                                                          
            }
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les trajets retour compatibles quand on affiche le membre matché pour faire des demandes de covoiturages
router.get("/trajets/retour/:id/:membreId/:passagerOuConducteur", auth, async function(req, res){
    try{
        // :id: id de la personne matchée
        // :membreId: id de la personne qui fait le matching

        // Comme pour le matching, on récupère les trajets de la personnes qui recherche et on les classe par jour de la semaine
        // Uniquement les trajets pour lesquels on a pas trouvé de covoiturage ou on a encore de la place
        const mesTrajets = await TrajetRetour.find({ $and: [ { membre_id: req.params.membreId },
                                                            { passager_sur_autre_trajet: false}, 
                                                            { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] } ] });

        MyObjectSortByDayOfWeek(mesTrajets);

        // On récupère le role de la personne matché pour mieux chercher les trajets compatibles
        const membreMatche = await Membre.findById(req.params.id);

        // On créé une arrya dans laquelle on va stocker les résultats:
        let trajetsTrouves = [];

        // Si le membre matché est conducteur exclusif
        if(membreMatche.role === "Je suis conducteur exclusif"){
            for(unTrajet of mesTrajets){
                if(unTrajet.conducteur_sur_ce_trajet === false){
                    // On exclu de mesTrajets ceux pour lesquels le membre qui match est conducteur
                    const research = await TrajetRetour.find({ $and: [ { membre_id: req.params.id },
                                                                      { jour: unTrajet.jour },
                                                                      { depart: unTrajet.depart },
                                                                      { destination: unTrajet.destination },
                                                                      { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                        $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                      { nombre_de_places: { $gte: 1 } }
                                                                    ]})

                    trajetsTrouves = trajetsTrouves.concat(research);
                }
            }
            if(trajetsTrouves.length === 0 ){
                res.json("Queud")
            } else {
                res.json(trajetsTrouves);                                                          
            }
        }

        // Si le membre matché est passager exclusif
        if(membreMatche.role === "Je suis passager exclusif"){
            for(unTrajet of mesTrajets){
                const research = await TrajetRetour.find({ $and: [ { membre_id: req.params.id },
                                                                  { jour: unTrajet.jour },
                                                                  { depart: unTrajet.depart },
                                                                  { destination: unTrajet.destination },
                                                                  { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                               $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                  { passager_sur_autre_trajet: false },
                                                                ]})

                trajetsTrouves = trajetsTrouves.concat(research);
            }
            if(trajetsTrouves.length === 0 ){
                res.json("Queud")
            } else {
                res.json(trajetsTrouves);                                                          
            }
        }

        // Si le membre matché a un role hybride, dans chaque if qui suit on fera une recherche en fonction de req.params.passagerOuConducteur
        if(membreMatche.role !== "Je suis conducteur exclusif" && membreMatche.role !== "Je suis passager exclusif"){

            if(req.params.passagerOuConducteur === "Conducteur"){
                // Le membre fait une demande en tant que conducteur, il cherche donc un trajet passager
                for(unTrajet of mesTrajets){
                    const research = await TrajetRetour.find({ $and: [ { membre_id: req.params.id },
                                                                      { jour: unTrajet.jour },
                                                                      { depart: unTrajet.depart },
                                                                      { destination: unTrajet.destination },
                                                                      { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                   $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                      { passager_sur_autre_trajet: false },
                                                                      { conducteur_sur_ce_trajet: false },
                                                                    //   { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] }
                                                                    ]})

                    trajetsTrouves = trajetsTrouves.concat(research);
                }
                res.json(trajetsTrouves);  
            }
            if(req.params.passagerOuConducteur === "Passager"){
                // Le membre fait une demande en tant que passager, il cherche donc un trajet conducteur
                for(unTrajet of mesTrajets){
                    if(unTrajet.conducteur_sur_ce_trajet === false){
                        // On exclu de mesTrajets ceux pour lesquels le membre qui match est conducteur
                        const research = await TrajetRetour.find({ $and: [ { membre_id: req.params.id },
                                                                          { jour: unTrajet.jour },
                                                                          { depart: unTrajet.depart },
                                                                          { destination: unTrajet.destination },
                                                                          { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                       $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                          { passager_sur_autre_trajet: false },
                                                                          { nombre_de_places: { $gte: 1 } }
                                                                        ]})
    
                        trajetsTrouves = trajetsTrouves.concat(research);
                    }
                }
                res.json(trajetsTrouves); 
            }
            if(req.params.passagerOuConducteur !== "Conducteur" && req.params.passagerOuConducteur !== "Passager"){
                // Tous les trajets de membre matché qui corresondent aux critères (que ce soit passager ou conducteur)       
                for(unTrajet of mesTrajets){
                    const research = await TrajetRetour.find({ $and: [ { membre_id: req.params.id },
                                                                      { jour: unTrajet.jour },
                                                                      { depart: unTrajet.depart },
                                                                      { destination: unTrajet.destination },
                                                                      { heure_depart_en_minutes: { $gte: unTrajet.heure_depart_en_minutes - 15, // $gte: > ou =
                                                                                                   $lte: unTrajet.heure_depart_en_minutes + 15} }, // $lte: < ou =
                                                                      { passager_sur_autre_trajet: false },
                                                                      { $or: [ { nombre_de_places: { $exists: false } }, { nombre_de_places: { $gte: 1 } } ] }
                                                                    ]})

                    trajetsTrouves = trajetsTrouves.concat(research);
                }
                if(trajetsTrouves.length === 0 ){
                    res.json("Queud")
                } else {
                    res.json(trajetsTrouves);                                                          
                }
            }
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;