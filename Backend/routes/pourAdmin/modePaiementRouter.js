const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const ModePaiement = require('../../models/menuDeroulant/modePaiementModel');

router.post("/ajouter", adminAuth, async function(req, res){
    try{
        // Validation
        if(!req.body.type){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer un mode de paiement" });
        }

        const modePaiementDoublon = await ModePaiement.findOne({ type: req.body.type });
        if(modePaiementDoublon){
            return res
                .status(400)
                .send({ msg: "Ce mode de paiement est déjà enregistré" })
        }

        let modePaiement = new ModePaiement(req.body);

        const nouveau_modePaiement = await modePaiement.save();
        res.json(nouveau_modePaiement);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/supprimer/:id", adminAuth, async function(req, res){
    try{
        const supprimerModePaiement = await ModePaiement.findByIdAndDelete(req.params.id);
        res.json(supprimerModePaiement);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.get("/afficher", async function(req, res){
    try{
        const afficherModePaiement = await ModePaiement.find();
        res.json(afficherModePaiement);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.get("/afficher-un/:id", async function(req, res){
    try{
        const afficherUnModePaiement = await ModePaiement.findById(req.params.id);
        res.json(afficherUnModePaiement);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.put("/modifier/:id", adminAuth, async function(req, res){
    try{
        // Validation
        if(!req.body.type){
            return res
                .status(400)
                .send({ msg: "Indiquez le nom du mode de paiement" })
        }

        const modePaiementDoublon = await ModePaiement.findOne({ type: req.body.type });
        if(modePaiementDoublon){
            return res
                .status(400)
                .send({ msg: "Ce mode de paiement est déjà enregistré" })
        }
        
        const ModifierModePaiement = await ModePaiement.findById(req.params.id, function(err, modePaiement){
            if(!modePaiement){
                return res
                    .status(400)
                    .send({ msg: "mode de paiement non trouvé" })
            } else {
                modePaiement.type = req.body.type;
                modePaiement.save();
                res.json(modePaiement);
            }
        });

    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;