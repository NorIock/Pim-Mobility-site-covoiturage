const router = require('express').Router(); // Execute la fonction router
const adminAuth = require('../../middleware/adminAuth'); // Permet d'utiliser le middleware qui permet de vérifier qu'il s'agit bien d'un administrateur
const Actualite = require('../../models/actualiteModel'); // Permet d'utiliser le model actualité
const TypeActualite = require('../../models/menuDeroulant/typeActualiteModel'); // Permet d'utiliser le model type d'actualité

// Route qui permet de créer une nouvelle actualité
router.post("/creer", adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.type || !req.body.titre || !req.body.contenu){
            return res
                .status(400)
                .send({ msg: "Veuillez remplir tous les champs"});
        }

        if(req.body.type === "Choisir"){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer un type d'actualité"});
        }

        let nouvelleActualite = new Actualite(req.body);
        await nouvelleActualite.save();
        res.json(nouvelleActualite);

    } catch(err){
        res.status(500).json({error: err.message});
    }

});

// Route qui permet d'afficher une actualité avant de la modifier
router.get("/afficher-une-pour-maj/:id", adminAuth, async function(req, res){
    try{
        const recupererActualite = await Actualite.findById(req.params.id);

        if(recupererActualite.lentgh === 0){
            return res
                .status(400)
                .send({ msg: "Actualité non trouvée"});
        }
        res.json(recupererActualite);
        
    } catch(err){
        res.status(500).json({error: err.message});
    }

});

// Route qui permet de modifier une actualité
router.post("/modifier/:id", adminAuth, async function(req, res){
    try{
        const modifierActualite = await Actualite.findById(req.params.id);
        
        if(modifierActualite.length === 0){
            return res
                .status(400)
                .send({ msg: "Actualité non trouvée"});
        } else {
            if(req.body.type && req.body.type !== "Choisir"){modifierActualite.type = req.body.type}
            if(req.body.titre){modifierActualite.titre = req.body.titre}
            if(req.body.contenu){modifierActualite.contenu = req.body.contenu}
            if(req.body.visible !== "Choisir"){
                if(req.body.visible === "Oui"){modifierActualite.visible = true}
                if(req.body.visible === "Non"){modifierActualite.visible = false}
            }
            await modifierActualite.save();
            res.json(modifierActualite);
        }

    } catch(err){
        res.status(500).json({error: err.message});
    }

});

// Route qui permet d'afficher toutes les actualités sur la page admin
router.get("/admin/toutes", adminAuth, async function(req, res){
    try{
        const touesLesActualites = await Actualite.find().sort({ date: -1});
        res.json(touesLesActualites);

    } catch(err){
        res.status(500).json({error: err.message});
    }
});

// Route qui permet d'afficher les actualités sur la page d'accueil
router.get("/visible", async function(req, res){
    try{
        const afficherLesVisibles = await Actualite.find({ visible: true }).sort({ date: -1 });
        if(afficherLesVisibles.length !== 0){
            res.json(afficherLesVisibles);
        } else {
            res.json("Queud");
        }
    } catch(err){
        res.status(500).json({error: err.message});
    }
});

// Route qui permet de modifier l'affichage ou non d'une actualité
router.post("/gerer-affichage/:id", adminAuth, async function(res, res){
    try{
        const modifierVisibiliteActualite = await Actualite.findById(req.params.id);

        modifierVisibiliteActualite.visible = req.body.nouvelleVisibilite;

        await modifierVisibiliteActualite.save();
        res.json(modifierVisibiliteActualite);        

    } catch(err){
        res.status(500).json({error: err.message});
    }
});

// Route qui permet de supprimer une actualité
router.delete("/supprimer/:id", adminAuth, async function(req, res){
    try{      
        const supprimerActualite = await Actualite.findByIdAndDelete(req.params.id);
        res.json(supprimerActualite);

    } catch(err){
        res.status(500).json({error: err.message});
    }
});

// Les 4 routes suivantes sont pour le menu déroulant du type d'actualité

// Permet de créer un nouveau type pour le menu déroulant du type d'actualité
router.post('/menu-deroulant/ajouter', adminAuth, async function(req, res){
    try {
        // Validation
        if(!req.body.nom){
            return res
                .status(400)
                .send({ msg: "Le type d'actualité doit avoir un nom"});
        }

        const typeActualiteDoublon = await TypeActualite.findOne({ nom: req.body.nom });
        if(typeActualiteDoublon){
            return res
                .status(400)
                .send({ msg: "Un type d'actualité existe déjà avec ce nom" });
        }

        let typeActualite = new TypeActualite(req.body);

        await typeActualite.save();
        res.json(typeActualite);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

// Permet de modifier le type pour le menu déroulant du type d'actualité
router.put('/menu-deroulant/modifier/:id', adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.nom){
            return res
                .status(400)
                .send({ msg: "Le type d'actualité doit avoir un nom"});
        }

        const typeActualiteDoublon = await TypeActualite.findOne({ nom: req.body.nom });
        if(typeActualiteDoublon){
            return res
                .status(400)
                .send({ msg: "Un type d'actualité existe déjà avec ce nom" });
        }

        const modifierTypeActualite = await TypeActualite.findById(req.params.id, function(err, type){
            if(!type){
                res.status(400).send({ msg: "Type non trouvé"});
            } else {
                type.nom = req.body.nom;
                type.save();
                res.json(type);
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// Permet d'afficher tous les types pour le menu déroulant du type d'actualité
router.get('/menu-deroulant/afficher', async function(req, res){
    try{
        const afficherTypeActualite = await TypeActualite.find();

        res.json(afficherTypeActualite);

    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

// Permet d'afficher un seul type pour le menu déroulant du type d'actualité
router.get('/menu-deroulant/afficher-un/:id', async function(req, res){
    try {
        const afficherUnTypeActualite = await TypeActualite.findById(req.params.id);
        res.json(afficherUnTypeActualite);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

// Permet de supprimer un type pour le menu déroulant du type d'actualité
router.delete('/menu-deroulant/supprimer/:id', adminAuth, async function(req, res){
    try{
        const supprimerTypeActualite = await TypeActualite.findByIdAndDelete(req.params.id);
        res.json(supprimerTypeActualite);

    } catch (err){
        res.status(500).json({ error: err.message});
    }
});

module.exports = router;