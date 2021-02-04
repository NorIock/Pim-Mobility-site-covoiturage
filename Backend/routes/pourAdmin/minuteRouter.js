const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const Minute = require('../../models/menuDeroulant/minuteModel');

router.post("/ajouter", adminAuth, async function(req, res){
    try{
        // Validation

        if(!req.body.chiffre){
            return res
                .status(400)
                .send({ msg: "Veuillez remplir le champs"})
        }

        const minuteDoublon = await Minute.findOne({ chiffre: req.body.chiffre });
        if(minuteDoublon){
            return res
                .status(400)
                .send({ msg: "Cette donnée existe déjà" })
        }

        let minute = new Minute(req.body);
        const nouvelle_minute = await minute.save();
        res.json(nouvelle_minute);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher", async function(req, res){
    try{
        const afficherMinute = await Minute.find().sort({ chiffre: 1 });
        res.json(afficherMinute);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.get("/afficher-une/:id", async function(req, res){
    try{
        const afficherUneMinute = await Minute.findById(req.params.id);
        res.json(afficherUneMinute);

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
                .send({ msg: "Veillez remplir le champs" })
        }

        const minuteDoublon = await Minute.findOne({ chiffre: req.body.chiffre });
        if(minuteDoublon){
            return res
                .status(400)
                .send({ msg: "Cette donnée existe déjà" })
        }
        
        const modifierMinute = await Minute.findById(req.params.id, function(err, minute){
            if(!minute){
                return res
                    .status(400)
                    .send({ msg: "Donnée non trouvée" })
            } else {
                minute.chiffre = req.body.chiffre;
                minute.save();
                res.json(minute);
            }
        });

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/supprimer/:id", adminAuth, async function(req, res){
    try{
        const supprimerMinute = await Minute.findByIdAndDelete(req.params.id);
        res.json(supprimerMinute);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;