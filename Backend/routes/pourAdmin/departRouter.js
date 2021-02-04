const router = require('express').Router(); // Execute la fonction Router()
const adminAuth = require('../../middleware/adminAuth'); // Permet d'utiliser le middleware adminAuth qui vérifie que le membre est admin
const Depart = require('../../models/menuDeroulant/departModel'); // Permet d'utiliser le model depart
const TrajetAller = require('../../models/trajetAllerModel');
const TrajetRetour = require('../../models/trajetRetourModel');

router.post('/ajouter', adminAuth, async function(req, res){
    try {
        // Validation
        if(!req.body.nom){
            return res
                .status(400)
                .send({ msg: "Le départ doit avoir un nom" });
        }

        const departDoublon = await Depart.findOne({ nom: req.body.nom });
        if(departDoublon){
            return res
                .status(400)
                .send({ msg: "Un départ existe déjà avec ce nom" });
        }

        let depart = new Depart(req.body);
        const nouveauDepart = await depart.save();
        res.json(nouveauDepart);

    } catch (err){
        res.status(500).json({ error: err.message});
    }
});

router.delete('/supprimer/:id', adminAuth, async function(req, res){
    try {
        const supprimerDepart = await Depart.findByIdAndDelete(req.params.id);
        res.json(supprimerDepart);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.get('/afficher', async function(req, res){
    try {
        const afficherDeparts = await Depart.find().sort({ nom: 1 }).populate("quartiers").exec(function(err, departs){
            res.json(departs);
        });

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.get('/afficher-un/:id', async function(req, res){
    try{
        const afficherUnDepart = await Depart.findById(req.params.id).populate("quartiers");
        res.json(afficherUnDepart);
        
    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.put('/modifier/:id', adminAuth, async function(req, res){
    try {
        // Validations
        const departDoublon = await Depart.findOne({ nom: req.body.nom });
        if(departDoublon){
            return res
                .status(400)
                .send({ msg: "Un départ existe déjà avec ce nom" });
        }

        const modifierDeparts = await Depart.findById(req.params.id);
        if(!modifierDeparts){
            return res 
            .status(400)
            .send({ msg: "Départ à modifier non trouvé" })
        } else {
            var departOuDestinationAvantModif = modifierDeparts.nom;
            modifierDeparts.nom = req.body.nom;
            modifierDeparts.save();  
        }
        
        // Comme les départs sont inscrits dans le dur dans le model trajet, si l'administrateur modifie un départ, cela risque
        // de créer un souci pour le matching. On va donc récupérer tous les trajets avec ce départ (ou destination pour les trajets retour) 
        // pour faire cette modification
        
        // On commence avec les départs des trajets aller
        const trajetsAllerDepart = await TrajetAller.find({ depart: departOuDestinationAvantModif});

        for(trajetAllerDepart of trajetsAllerDepart){
            trajetAllerDepart.depart = req.body.nom;
            await trajetAllerDepart.save();
        }

        // On fait la même chose avec les destination des trajets retour
        const trajetsRetourDestination = await TrajetRetour.find({ destination: departOuDestinationAvantModif});

        for(trajetRetourDestination of trajetsRetourDestination){
            trajetRetourDestination.destination = req.body.nom;
            await trajetRetourDestination.save();
        }
        
        res.json(modifierDeparts);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

module.exports = router;