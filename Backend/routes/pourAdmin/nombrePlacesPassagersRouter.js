const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const NombrePlacesPassagers = require('../../models/menuDeroulant/nombrePlacesPassagersModel');

router.post("/ajouter", adminAuth, async function(req, res){
    try{
        // Validation
        if(!req.body.nombre){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer une donnée" })
        }

        const nombrePlacesDoublon = await NombrePlacesPassagers.findOne({ nombre: req.body.nombre });
        if(nombrePlacesDoublon){
            return res
                .status(400)
                .send({ msg: "Cette donnée existe déjà" })
        }

        let nombrePlacePassagers = new NombrePlacesPassagers(req.body);
        const nouveau_nombrePlacesPassagers = await nombrePlacePassagers.save();
        res.json(nouveau_nombrePlacesPassagers);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher", async function(req, res){
    try{
        const afficherNombrePlacesPassagers = await NombrePlacesPassagers.find().sort({ nombre: 1 });
        res.json(afficherNombrePlacesPassagers);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher-un/:id", async function(req, res){
    try{
        const afficherUnNombrePlacesPassagers = await NombrePlacesPassagers.findById(req.params.id);
        res.json(afficherUnNombrePlacesPassagers);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.put("/modifier/:id", adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.nombre){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer une donnée" })
        }

        const nombrePlacesDoublon = await NombrePlacesPassagers.findOne({ nombre: req.body.nombre });
        if(nombrePlacesDoublon){
            return res
                .status(400)
                .send({ msg: "Cette donnée existe déjà" })
        }

        const modifierNombrePlacesPassagers = await NombrePlacesPassagers.findById(req.params.id, function(err, nombrePlace){
            if(!nombrePlace){
                return res
                    .status(400)
                    .send({ msg: "Donnée non trouvée" })
            } else {
                nombrePlace.nombre = req.body.nombre;
                nombrePlace.save();
                res.json(nombrePlace);
            }
        });

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/supprimer/:id", adminAuth, async function(req, res){
    try{
        const supprimerNombrePlacesPassager = await NombrePlacesPassagers.findByIdAndDelete(req.params.id);
        res.json(supprimerNombrePlacesPassager);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;