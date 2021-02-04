const router = require('express').Router(); // Execute la fonction Router()
const adminAuth = require('../../middleware/adminAuth'); // Permet d'utiliser le middleware adminAuth qui vérifie que le membre est admin
const Destination = require('../../models/menuDeroulant/destinationModel'); // Permet d'utiliser le model destination
const TrajetAller = require('../../models/trajetAllerModel');
const TrajetRetour = require('../../models/trajetRetourModel');

router.post("/ajouter", adminAuth, async function(req, res){
    try {
        // Validations
        if(!req.body){
            return res
                .status(400)
                .send({ msg: "La destination doit avoir un nom" })
        }

        const destinationDoublon = await Destination.findOne({ nom: req.body.nom });
        if (destinationDoublon){
            return res 
                .status(400)
                .send({ msg: "Une destination existe déjà avec ce nom" })
        }

        let destination = new Destination(req.body);
        const nouvelleDestination = await destination.save();
        res.json(nouvelleDestination);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.delete("/supprimer/:id", adminAuth, async function(req, res){
    try {
        const supprimerDestination = await Destination.findByIdAndDelete(req.params.id);
        res.json(supprimerDestination);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.get('/afficher', async function(req, res){
    try {
        const afficherDestination = await Destination.find().sort({ nom: 1 }).populate("quartiers").exec(function(err, destinations){
            res.json(destinations);
        });

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.get("/afficher-une/:id", async function(req, res){
    try {
        const afficherUneDestination = await Destination.findById(req.params.id).populate("quartiers");
        res.json(afficherUneDestination);

        } catch(err){
            res.status(500).json({ error: err.message});
        }
    }
)

router.put('/modifier/:id', adminAuth, async function(req, res){
    try {
        // Validations
        const destinationDoublon = await Destination.findOne({ nom: req.body.nom });
        if (destinationDoublon){
            return res 
                .status(400)
                .send({ msg: "Une destination existe déjà avec ce nom" })
        }

        const modifierDestination = await Destination.findById(req.params.id);
            if(!modifierDestination){
                return res 
                    .status(400)
                    .send({ msg: "Destination à modifier non trouvée" })
            } else {
                var departOuDestinationAvantModif = modifierDestination.nom;
                modifierDestination.nom = req.body.nom;
                await modifierDestination.save();
            }
        // Comme les destinations sont inscrites dans le dur dans le model trajet, si l'administrateur modifie une destination ça risque de 
        // créer un souci pour le matchingtous, on va donc récupérer tous les trajets avec cette destination (ou départ pour les trajets
        // retour) pour faire cette modification 

        // On commence avec les trajets aller
        const trajetsAllerDestination = await TrajetAller.find({ destination: departOuDestinationAvantModif });

        for(trajetAllerDestination of trajetsAllerDestination){
            trajetAllerDestination.destination = req.body.nom;
            await trajetAllerDestination.save();
        }
        
        // On fait la même chose pur les trajets retour
        const trajetsRetourAller = await TrajetRetour.find({ depart: departOuDestinationAvantModif });

        for(trajetRetourAller of trajetsRetourAller){
            trajetRetourAller.depart = req.body.nom;
            await trajetRetourAller.save();
        }

        res.json(modifierDestination);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

module.exports = router;