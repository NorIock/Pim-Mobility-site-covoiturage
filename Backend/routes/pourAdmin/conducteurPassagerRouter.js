const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const ConducteurPassager = require('../../models/menuDeroulant/conducteurPassagerModel');

router.post("/ajouter", adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.type){
            return res
                .status(400)
                .send({ msg: "Veuillez remplir le champ" })
        }

        const conducteurPassagerDoublon = await ConducteurPassager.findOne({ type: req.body.type });
        if(conducteurPassagerDoublon){
            return res
                .status(400)
                .send({ msg: "Existe déjà dans la base de donnée" })
        }

        let conducteurPassager = new ConducteurPassager(req.body);

        const nouveau_conducteurPassager = await conducteurPassager.save();
        res.json(nouveau_conducteurPassager);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.get("/afficher", async function(req, res){
    try{
        const afficherConducteurPassager = await ConducteurPassager.find();
        res.json(afficherConducteurPassager);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher-un/:id", async function(req, res){
    try{
        const afficherUnConducteurPassager = await ConducteurPassager.findById(req.params.id);
        res.json(afficherUnConducteurPassager);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.put("/modifier/:id", adminAuth, async function(req, res){
    try{
        const conducteurPassagerDoublon = await ConducteurPassager.findOne({ type: req.body.type });
        if(conducteurPassagerDoublon){
            return res
                .status(400)
                .send({ msg: "Existe déjà dans la base de donnée" })
        }
        
        const modifierUnConducteurPassager = await ConducteurPassager.findById(req.params.id, function(err, conducteurPassager){
            if(!conducteurPassager){
                return res
                    .status(400)
                    .send({ msg: "Aucune donnée pour cet id" })
            } else {
                conducteurPassager.type = req.body.type;
                conducteurPassager.save();
                res.json(conducteurPassager);
            }
        });

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/supprimer/:id", adminAuth, async function(req, res){
    try{
        const supprimerUnConducteurPassager = await ConducteurPassager.findByIdAndDelete(req.params.id);
        res.json(supprimerUnConducteurPassager);
        
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;