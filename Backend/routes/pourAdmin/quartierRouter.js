const router = require("express").Router();
const adminAuth = require("../../middleware/adminAuth");
const Depart = require("../../models/menuDeroulant/departModel");
const Destination = require("../../models/menuDeroulant/destinationModel");
const Quartier = require("../../models/menuDeroulant/quartierPourDepartDestinationModel");

// Permet d'ajouter un quartier à un départ ou une destination
router.post("/ajouter/:departOuDestination/:id", adminAuth, async function(req, res){
    try{

        // Validation
        if(!req.body.nomQuartier){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer le nom du quartier" })
        }

        let nouveauQuartier = new Quartier({
            nom_quartier: req.body.nomQuartier,
        })

        await nouveauQuartier.save();

        if(req.params.departOuDestination === "depart"){
            const departNouveauQuartier = await Depart.findById(req.params.id);
            departNouveauQuartier.quartiers.push(nouveauQuartier);

            await departNouveauQuartier.save();
            res.json(departNouveauQuartier);
        }

        if(req.params.departOuDestination === "destination"){
            const destinationNouveauQuartier = await Destination.findById(req.params.id);
            destinationNouveauQuartier.quartiers.push(nouveauQuartier);

            await destinationNouveauQuartier.save();
            res.json(destinationNouveauQuartier);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher les quartiers d'un départ ou d'une destination
router.get("/afficher/:departOuDestination/:id", async function(req, res){
    try{

        if(req.params.departOuDestination === "depart"){
            var quartiersZone = await Depart.findById(req.params.id).populate("quartiers");
        }

        if(req.params.departOuDestination === "destination"){
            var quartiersZone = await Destination.findById(req.params.id).populate("quartiers");
        }

        res.json(quartiersZone);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher le détail d'un quartier
router.get("/afficher-un/:quartierId", async function(req, res){
    try{
        const afficherUnTrajet = await Quartier.findById(req.params.quartierId);

        res.json(afficherUnTrajet);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de modifier un quartier
router.put("/modifier/:quartierId", adminAuth, async function(req, res){
    try{
        // Validation
        if(!req.body.nomQuartier){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer le nouveau nom du quartier que vous souhaitez modifier"})
        }

        const modifierQuartier = await Quartier.findById(req.params.quartierId);

        modifierQuartier.nom_quartier = req.body.nomQuartier;

        await modifierQuartier.save();
        res.json(modifierQuartier);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de supprimer un quartier
router.delete("/supprimer/:quartierId/:departOuDestination/:zoneId", adminAuth, async function(req, res){
    try{

        const supprimerQuartier = await Quartier.findByIdAndDelete(req.params.quartierId);

        // Maintenant on récupère le départ ou la destination pour supprimer le quartier dans le one-to-many
        if(req.params.departOuDestination === "depart"){
            const modifierDepart = await Depart.findById(req.params.zoneId);

            modifierDepart.quartiers.pull(supprimerQuartier);
            await modifierDepart.save();
        }

        if(req.params.departOuDestination === "destination"){
            const modifierDestination = await Destination.findById(req.params.zoneId);

            modifierDestination.quartiers.pull(supprimerQuartier);
            await modifierDestination.save();
        }

        res.json(supprimerQuartier);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'avoir tous les quartiers à partir d'un départ
router.get("/afficher-selon-depart/:depart", async function(req, res){
    try{

        const quartiersDeparts = await Depart.findOne({ nom: req.params.depart }).populate("quartiers");

        if(quartiersDeparts !== null){
            res.json(quartiersDeparts.quartiers);
        } else {
            res.json([]);
        }
        
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'avoir tous les quartiers à partir d'une destination
router.get("/afficher-selon-destination/:destination", async function(req, res){
    try{

        const quartiersDestination = await Destination.findOne({ nom: req.params.destination }).populate("quartiers");

        if(quartiersDestination !== null){
            res.json(quartiersDestination.quartiers);
        } else {
            res.json([]);
        }
        
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;