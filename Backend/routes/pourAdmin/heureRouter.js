const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const Heure = require('../../models/menuDeroulant/heureModel');

router.post("/ajouter", adminAuth, async function(req, res){
    try{
        // Validation

        if(!req.body.chiffre){
            return res
                .status(400)
                .send({ msg: "Veuillez remplir le champs"})
        }

        const heureDoublon = await Heure.findOne({ chiffre: req.body.chiffre });
        if(heureDoublon){
            return res
                .status(400)
                .send({ msg: "Cette donnée existe déjà" })
        }

        let heure = new Heure(req.body);
        const nouvelle_heure = await heure.save();
        res.json(nouvelle_heure);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher", async function(req, res){
    try{
        const afficherHeure = await Heure.find().sort({ chiffre: 1 });
        res.json(afficherHeure);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher-une/:id", async function(req, res){
    try{
        const afficherUneHeure = await Heure.findById(req.params.id);
        res.json(afficherUneHeure);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.put("/modifier/:id", adminAuth, async function(req, res){
    try{
        // Validation
        if(!req.body.chiffre){
            return res
                .status(400)
                .send({ msg: "Veillez remplir le champ" })
        }

        const heureDoublon = await Heure.findOne({ chiffre: req.body.chiffre });
        if(heureDoublon){
            return res
                .status(400)
                .send({ msg: "Cette donnée existe déjà" })
        }

        const modifierHeure = await Heure.findById(req.params.id, function(err, heure){
            if(!heure){
                return res
                    .status(400)
                    .send({ msg: "Donnée non trouvée" })
            } else {
                heure.chiffre = req.body.chiffre;
                heure.save();
                res.json(heure);
            }
        });

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/supprimer/:id", adminAuth, async function(req, res){
    try{
        const supprimerHeure = await Heure.findByIdAndDelete(req.params.id);
        res.json(supprimerHeure);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;