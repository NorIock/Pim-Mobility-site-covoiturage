const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const MotifRefusDemandeDeCovoiturage = require('../../models/menuDeroulant/motifRefusDemandeCovoiturageModel');

router.post("/ajouter", adminAuth, async function(req, res){
    try{
        // Validation
        if(!req.body.motif){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer un nouveau motif" });
        }

        const motifRefusDoublon = await MotifRefusDemandeDeCovoiturage.findOne({ motif: req.body.motif });
        if(motifRefusDoublon){
            return res
                .status(400)
                .send({ msg: "Ce motif a déjà été enregistré "});
        }

        let motif = new MotifRefusDemandeDeCovoiturage(req.body);
        const nouveau_motif = await motif.save();
        res.json(nouveau_motif);

    } catch(err){
        res.status(500).send({ error: err.message });
    }
});

router.delete("/supprimer/:id", adminAuth, async function(req, res){
    try{
        const supprimerMotif = await MotifRefusDemandeDeCovoiturage.findByIdAndDelete(req.params.id);
        res.json(supprimerMotif);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher", async function(req, res){
    try{
        const afficherMotifs = await MotifRefusDemandeDeCovoiturage.find().exec(function(err, motifs){
            res.json(motifs);
        });

    } catch(err){
        res.status(500).send({ error: err.message });
    }
});

router.get("/afficher-un/:id", async function(req, res){
    try{
        const afficherUnMotif = await MotifRefusDemandeDeCovoiturage.findById(req.params.id);
        res.json(afficherUnMotif);

    } catch(err){
        res.status(500).send({ error: err.message });
    }
});

router.put("/modifier/:id", adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.motif){
            return res
                .status(400)
                .send({ msg: "Veuillez modifier le motif" });
        }

        const motifDoublon = await MotifRefusDemandeDeCovoiturage.findOne({ motif: req.body.motif });
        if(motifDoublon){
            return res
                .status(400)
                .send({ msg: "Ce motif est déjà enregistré" })
        }

        const modifierMotifRefus = await MotifRefusDemandeDeCovoiturage.findById(req.params.id, function(err, motifRefus){
            if(!motifRefus){
                return res
                    .status(400)
                    .send({ msg: "motif non trouvé" })
            } else {
                motifRefus.motif = req.body.motif;
                motifRefus.save();
                res.json(motifRefus);
            }
        });

    } catch(err){
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;