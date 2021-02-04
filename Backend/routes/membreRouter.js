const router = require("express").Router(); // Execute la fonction Router()
const bcrypt = require('bcryptjs'); // Permet d'utiliser bcrypt pour hasher et comparer les mots de passe
const jwt = require('jsonwebtoken'); // Permet d'utiliser les JWT pour les sessions
const auth = require('../middleware/auth'); // Permet d'utiliser le middleware auth
const adminAuth = require('../middleware/adminAuth'); // Permet d'utiliser le middleware adminAuth
const Membre = require('../models/membreModel'); // Permet d'utiliser le modèle membre
const TrajetsAller = require('../models/trajetAllerModel');
const TrajetsRetour = require('../models/trajetRetourModel');
// const { route } = require("./trajetAllerRouter");

router.post('/inscription', async function(req, res){
    try {
        // Validation:
        if(!req.body.nom ||
            !req.body.prenom ||
            !req.body.email ||
            !req.body.mot_de_passe ||
            !req.body.mot_de_passe_confirmation ||
            !req.body.telephone){
            return res
                .status(400)
                .send({ msg: "Tous les champs marqués d'une étoile doivent être remplis" });
        }
        if(req.body.mot_de_passe.length < 5){
            return res
                .status(400)
                .send({ msg: "5 charactères minimum pour le mot de passe" });
        }
        if(req.body.mot_de_passe !== req.body.mot_de_passe_confirmation){
            return res
                .status(400)
                .send({ msg: "Le mot de passe et sa confirmation doivent correspondre" });
        }
        if(!RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$').test(req.body.email)){
            return res
                .status(400)
                .send({ msg: "Le format de l'email doit être valide" });
        }
        if(!RegExp('[0]{1}[6-7]{1}[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}').test(req.body.telephone)){
            return res
                .status(400)
                .send({ msg:"Le téléphone doit comporter 10 chiffres et commencer par 06 ou 07" });
        }

        const emailDoublon = await Membre.findOne({ email: req.body.email });
        if(emailDoublon){
            return res
                .status(400)
                .send({ msg: "Un compte existe déjà avec cet email" });
        }

        const salt = await bcrypt.genSalt(12); // Génère le sel pour le hashage du mot de passe. 12 est le minimum recommandé
        const mot_de_passe_hash = await bcrypt.hash(req.body.mot_de_passe, salt);
        
        let membre = new Membre({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,  
            mot_de_passe: mot_de_passe_hash,
            telephone: req.body.telephone,
            commune_entreprise: req.body.commune_entreprise,
        });
        
        const nouveau_membre = await membre.save()
        res.json(nouveau_membre);

    } catch(err) {
        res.status(500).json({ error: err.message});
    }

});

router.post("/inscription/part2/:id", auth, async function(req, res){
    try{
        // Validation:
        if((!req.body.mode_paiement && !req.body.role)
            || (req.body.role !== "Je suis passager exclusif" && !req.body.mode_paiement)){
            return res
                .status(400)
                .send({ msg: "Tous les champs doivent être complétés" });
        }

        const membre_complement = await Membre.findById(req.params.id, function(err, membre){
            if(!membre){
                return res
                    .status(400)
                    .send({ msg: "Aucun membre trouvé" });
            } else {
                membre.mode_paiement = req.body.mode_paiement;
                membre.role = req.body.role;
                membre.save();
                res.json(membre);
            }
        });
    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.post("/connexion", async function(req, res){
    try {
        // Validation:
        if(!req.body.email || !req.body.mot_de_passe){
            return res
                .status(400)
                .send({ msg: "Tous les champs doivent être remplis"});
        }

        const membre = await Membre.findOne({ email: req.body.email });
        if(!membre){
            return res
                .status(400)
                .send({ msg: "Aucun membre trouvé"});
        }

        const motsDePasseCorrespondent = await bcrypt.compare(req.body.mot_de_passe, membre.mot_de_passe);
        if(!motsDePasseCorrespondent){
            return res
            .status(400)
            .send({ msg: "Mauvais email ou mot de passe"});
        }

        const token = jwt.sign({ id: membre._id, test: membre.admin }, process.env.JWT_SECRET); // Le JWT_SECRET a été généré sur le site: https://passwordsgenerator.net/
        res.json({
            token,
            membre: {
                id: membre._id,
                nom: membre.nom,
                prenom: membre.prenom,
                email: membre.email,
                telephone: membre.telephone,
                date_inscription: membre.date_inscription,
                test: membre.admin,
                role: membre.role,
                mode_paiement: membre.mode_paiement,
                trajets_aller: membre.trajets_aller,
                trajets_retour: membre.trajets_retour
            }
        });

    } catch(err) {
        res.status(500).json({ error: err.message});
    }
});

router.get("/afficher/:id", auth, async function(req, res){
    try{
        const afficherMembre = await Membre.findById(req.params.id).populate('trajets_aller')
                                                                    .populate('trajets_retour')
                                                                    .populate({path: 'demandes_covoiturage',
                                                                                populate: 'trajet_aller_demande'
                                                                             })
                                                                    .populate({path:'demandes_covoiturage',
                                                                                populate: 'trajet_retour_demande'});
        res.json([afficherMembre]); // Il y a des crochets car l'API ne renvoyait qu'un objet, pas une array et le map ne fonctionnait pas

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Copie de la route ci-dessus, je souhaite faire quelque chose de plus propre car comme au début je voulais faire un
// map dessus alors que je me suis rendu compte par la suite que c'était stupide, je préfère refaire une route par
// anticipation de possibles futurs bug.
router.get("/afficher-un/:id", auth, async function(req, res){
    try{
        const afficherMembre = await Membre.findById(req.params.id).populate('trajets_aller')
                                                                    .populate('trajets_retour')
                                                                    .populate({path: 'demandes_covoiturage',
                                                                                populate: 'trajet_aller_demande'
                                                                             })
                                                                    .populate({path:'demandes_covoiturage',
                                                                                populate: 'trajet_retour_demande'});

        res.json(afficherMembre);

    } catch(err){
        res.status(500).json({ error: err.message });
    }

});

// Affiche tous les membres sauf les administrateurs
router.get("/afficher-tous", adminAuth, async function(req, res){
    try{
        // Admin est à false pour afficher uniquement les membres et pas les administrateurs
        const affichezLesTous = await Membre.find({ admin: false }).sort({ nom: 1 });

        res.json(affichezLesTous);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

// Affiche tous les membres sauf les administrateurs
router.get("/afficher-admin", adminAuth, async function(req, res){
    try{
        // Admin est à true pour afficher uniquement les administrateurs
        const affichezLesTous = await Membre.find({ admin: true }).sort({ nom: 1 });

        res.json(affichezLesTous);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

router.put("/maj/:id", auth, async function(req, res){
    try{
        //Validations:
        if(req.body.mot_de_passe && req.body.mot_de_passe.length < 5){
            return res
                .status(400)
                .send({ msg: "5 charactères minimum pour le mot de passe" });
        }
        if(req.body.mot_de_passe && 
            req.body.mot_de_passe_confirmation && 
            req.body.mot_de_passe !== req.body.mot_de_passe_confirmation){
            return res
                .status(400)
                .send({ msg: "Le mot de passe et sa confirmation doivent correspondre" });
        }
        if(req.body.email && !RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$').test(req.body.email)){
            return res
                .status(400)
                .send({ msg: "Le format de l'email doit être valide" });
        }
        if(req.body.telephone && !RegExp('[0]{1}[6-7]{1}[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}').test(req.body.telephone)){
            return res
                .status(400)
                .send({ msg:"Le téléphone doit comporter 10 chiffres et commencer par 06 ou 07" });
        }

        const emailDoublon = await Membre.findOne({ email: req.body.email });
        if(emailDoublon){
            return res
                .status(400)
                .send({ msg: "Un compte existe déjà avec cet email" });
        }     

        const modifierUnMembre = await Membre.findById(req.params.id, async function(err, membre){
            if(!membre){
                return res
                    .status(400)
                    .send({ msg: "Aucun membre trouvé pour cet id" })
            } else { //Permet de savoir quels champs sont renseignés pour modification et de les intégrer à la variable membre qu fera la mise à jour
                if(req.body.mot_de_passe &&
                    req.body.mot_de_passe_confirmation &&
                    req.body.mot_de_passe === req.body.mot_de_passe_confirmation){
                    const salt = await bcrypt.genSalt(12); // Génère le sel pour le hashage du mot de passe. 12 est le minimum recommandé
                    const mot_de_passe_hash = await bcrypt.hash(req.body.mot_de_passe, salt);
                    membre.mot_de_passe = mot_de_passe_hash
                }
                if(req.body.email){membre.email = req.body.email}
                if(req.body.telephone){membre.telephone = req.body.telephone}
                if(req.body.commune_entreprise){membre.commune_entreprise = req.body.commune_entreprise}
                if(req.body.mode_paiement){membre.mode_paiement = req.body.mode_paiement}
                if(req.body.role){
                    membre.role = req.body.role
                }

                membre.save();
                res.json(membre);
            }
        })

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.post("/indisponible/:id", auth, async function(req, res){
    try{
        const membreQuiChangeIndisponibilite = await Membre.findById(req.params.id);

        membreQuiChangeIndisponibilite.indisponible = req.body.nouvelleIndisponibilite;

        await membreQuiChangeIndisponibilite.save();

        res.json(membreQuiChangeIndisponibilite);
        
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/supprimer", auth, async function(req, res){ // Utiliser le middleware auth avant la fonction ce qui rend la route privée (besoin d'être connecté pour y accéder)
    try {
        // console.log("Dans la route pour supprimer un membre");

        // const supprimerMembre = await Membre.findByIdAndDelete(req.membre);
        // res.json(supprimerMembre);

    } catch(err) {
        res.status(500).json({ error: err.message})
    }
});

router.post("/verification-mdp/:id", auth, async function(req, res){
    try{
        // Validations
        if(!req.body.motDePasse){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer votre mot de passe."})
        }

        const membre = await Membre.findById(req.params.id);
        if(!membre){
            return res
                .status(400)
                .send({ msg: "Aucun membre trouvé"});
        }

        const motsDePasseCorrespondent = await bcrypt.compare(req.body.motDePasse, membre.mot_de_passe);
        if(!motsDePasseCorrespondent){
            return res
            .status(400)
            .send({ msg: "Mauvais mot de passe"});
        } else {
            return res.json(true);
        }
    } catch(err){
        res.status(500).json({ error: err.message })
    };
});

// Permet de récupérer les données du profil pour voir s'il est complet
router.get("/completer-compte-si-besoin/:id", async function(req, res){
    try {
        const membreComplet = await Membre.findById(req.params.id);
        res.json(membreComplet);

    } catch(err) {
        res.status(500).json({ error: err.message});
    }
});

// Vérifie s'il n'y a pas un problème entre le nombre de places disponible et le rôle (quand le membre était à la création passager exclusif)
router.get("/places-conformes/:id", auth, async function(req, res){
    try{
        // On récupère les données du membre
        const membreData = await Membre.findById(req.params.id).populate("trajets_aller").populate("trajets_retour");

        if(membreData.role !== "Je suis passager exclusif"){
            // Il n'est pas passager exclusif, on vérifie donc qu'il a bien un nombre de places disponible
            for(aller of membreData.trajets_aller){
                // Pour les trajets aller
                if(!aller.nombre_de_places_total){
                    // Si un trajet n'a pas de places, on envoie l'information au front
                    return res.json("Houston nous avons un problème");
                }
            }
            for(retour of membreData.trajets_retour){
                // Idem pour les trajets retours
                if(!retour.nombre_de_places_total){
                    // Si un trajet n'a pas de places, on envoie l'information au front
                    return res.json("Houston nous avons un problème");
                }
            }
        }
        // S'il n'y a pas de soucis, on renvoie ok
        res.json("Ok");

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

// Permet de créer un nouvel administrateur
router.post("/admin/creer", adminAuth, async function(req, res){
    try{
        // Validation:
        if(!req.body.nom ||
            !req.body.prenom ||
            !req.body.email ||
            !req.body.mot_de_passe ||
            !req.body.mot_de_passe_confirmation ||
            !req.body.telephone){
            return res
                .status(400)
                .send({ msg: "Tous les champs marqués d'une étoile doivent être remplis" });
        }
        if(req.body.mot_de_passe.length < 5){
            return res
                .status(400)
                .send({ msg: "5 charactères minimum pour le mot de passe" });
        }
        if(req.body.mot_de_passe !== req.body.mot_de_passe_confirmation){
            return res
                .status(400)
                .send({ msg: "Le mot de passe et sa confirmation doivent correspondre" });
        }
        if(!RegExp('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$').test(req.body.email)){
            return res
                .status(400)
                .send({ msg: "Le format de l'email doit être valide" });
        }
        if(!RegExp('[0]{1}[6-7]{1}[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}').test(req.body.telephone)){
            return res
                .status(400)
                .send({ msg:"Le téléphone doit comporter 10 chiffres et commencer par 06 ou 07" });
        }

        const emailDoublon = await Membre.findOne({ email: req.body.email });
        if(emailDoublon){
            return res
                .status(400)
                .send({ msg: "Un compte existe déjà avec cet email" });
        }

        const salt = await bcrypt.genSalt(12); // Génère le sel pour le hashage du mot de passe. 12 est le minimum recommandé
        const mot_de_passe_hash = await bcrypt.hash(req.body.mot_de_passe, salt);

        let membre = new Membre({
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,  
            mot_de_passe: mot_de_passe_hash,
            telephone: req.body.telephone,
            commune_entreprise: req.body.commune_entreprise,
            admin: req.body.admin,
        });
        
        const nouveau_membre = await membre.save()
        res.json(nouveau_membre);

    } catch(err){
        res.status(500).json({error: err.message});
    }
});

// Permet de supprimer un administrateur. Il s'agit d'un post car on envoi un mot de passe
router.post("/admin/supprimer/:id/:membreId", adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.motDePasse){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer le mot de passe" })
        }

        // On vérifie que l'on essaie pas de supprimer le dernier administrateur
        const dernierAdministrateur = await Membre.find({ admin: true });
        if(dernierAdministrateur.length < 2){
            return res
                .status(400)
                .send({ msg: "Vous ne pouvez pas supprimer le dernier administrateur"});
        }

        // On vérifie que l'on essaie pas de supprimer son propre profil
        if(req.params.id === req.params.membreId){
            return res
                .status(400)
                .send({ msg: "Vous ne pouvez pas supprimer votre profil administrateur"});
        }

        if(req.body.motDePasse === process.env.MOT_DE_PASSE){
            const supprimerAdmin = await Membre.findByIdAndDelete(req.params.id);
            res.json(supprimerAdmin);
        }
        if(req.body.motDePasse !== process.env.MOT_DE_PASSE){
            return res
                .status(400)
                .send({ msg: "Mauvais mot de passe" })
        }

    } catch(err){
        res.status(500).json({error: err.message});
    }
});

router.post("/tokenValide", async function(req, res){ //Permet d'envoyer true ou false si le token est valide ou non
    try {
        
        const token = req.header("x-auth-token");
        if(!token){
            return res.json(false);
        }
        
        const verifierToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!verifierToken){
            return res.json(false);
        }
        
        const membre = await Membre.findById(verifierToken.id);
        if(!membre){ // Si le token existe encore mais plus le membre (compte supprimé par exemple), on bloque l'accès
            return res.json(false) 
        }; 
        
        return res.json(true); // Si on ne rentre dans aucun des if, on renvoie true

    } catch(err) {
        res.status(500).json({ error: err.message});
    }
});

router.get("/", auth, async function(req, res){ // Permet de récupérer les informations du membre connecté, auth car c'est une route privée
    const membre = await Membre.findById(req.membre); // Comme il y a auth, on peut récupérer l'id par req.membre

    if(membre.admin === true){
        res.json({
            prenom: membre.prenom,
            id: membre._id,
            test: membre.admin
        })
    } else {
        res.json({
            prenom: membre.prenom,
            id: membre._id
        })
    }
});

// Permet de recupérer les conducteurs
router.get("/conducteurs", adminAuth, async function(req, res){
    try{
        const conducteur = await Membre.find({ role: "Je suis conducteur exclusif"});

        if(conducteur.length === 0){
            res.json("Queud")
        } else {
            res.json(conducteur);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les conducteurs qui peuvent être passagers
router.get("/conducteurs-et-passagers", adminAuth, async function(req, res){
    try{
        const conducteurEtPassagers = await Membre.find({ role: "Je suis conducteur mais disposé à me mettre en passager"});

        if(conducteurEtPassagers.length === 0){
            res.json("Queud")
        } else {
            res.json(conducteurEtPassagers);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Peermet de récupérer les passagers qui peuvent être conducteur"
router.get("/passagers-et-conducteurs", adminAuth, async function(req, res){
    try{
        const passagersEtConducteurs = await Membre.find({ role: "Je suis passager et conducteur occasionnel"});

        if(passagersEtConducteurs.length === 0){
            res.json("Queud")
        } else {
            res.json(passagersEtConducteurs);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les passagers
router.get("/passagers", adminAuth, async function(req, res){
    try{
        const passager = await Membre.find({ role: "Je suis passager exclusif"});

        if(passager.length === 0){
            res.json("Queud")
        } else {
            res.json(passager);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les indisponibles
router.get("/indisponible", adminAuth, async function(req, res){
    try{
        const indisponible = await Membre.find({ indisponible: true });

        if(indisponible.length === 0){
            res.json("Queud")
        } else {
            res.json(indisponible);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les membres qui n'ont passé qu'une seule étape de la création du profil
router.get("/une-etape-creation-profil", adminAuth, async function(req, res){
    try{
        const UneEtape = await Membre.find({ $and: [ { role: null }, {admin: false }] });

        if(UneEtape.length === 0){
            res.json("Queud")
        } else {
            res.json(UneEtape);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer les membres qui n'ont passé que deux étapes de la création du profil
router.get("/deux-etapes-creation-profil", adminAuth, async function(req, res){
    try{
        // const DeuxEtapes = await Membre.find({ $and: [ { trajets_aller: { $exists: false } }, { trajets_retour: { $exists: false } }, {admin: false }] });
        // const DeuxEtapes = await Membre.find({ trajets_aller: { $exists: false } } );
        // Je n'arrive pas à trouver les membres qui n'ont pas de trajet, même la 2ième requete me sort que les admin et pas ceux
        // qui n'ont pas de trajet. Je vais utiliser filter

        const deuxEtapes = await Membre.find({ admin: false });

        const result = deuxEtapes.filter(une => une.trajets_aller.length === 0);

        const result2 = result.filter(deux => deux.role);

        if(result2.length === 0){
            res.json("Queud")
        } else {
            res.json(result2);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;