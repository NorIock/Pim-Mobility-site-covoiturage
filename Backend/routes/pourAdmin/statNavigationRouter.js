const router = require('express').Router();
const adminAuth = require('../../middleware/adminAuth');
const StatNavigation = require('../../models/statNavigationModel');

// Dans la route qui permet d'enregistrer un passage sur une page spécifique
router.post("/nouveauPassage", async function(req, res){
    try{

        let nouvelleNavigation = new StatNavigation({
            page: req.body.page,
            fait_par_membreId: req.body.membreId,
            fait_par_membrePrenom: req.body.membrePrenom
        });

        const nouveau = await nouvelleNavigation.save();
        res.json(nouveau);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de récupérer le nombre de navigation sur le matching aller/retour, covoit'ici, train, bus et velo
router.get("/recuperer/nombre/navigation/:page", adminAuth, async function(req, res){
    try{

        const nombreNavigation = await StatNavigation.find({ page: req.params.page });
        
        if(nombreNavigation.length === 0){
            res.json("Queud");
        } else {
            res.json(nombreNavigation);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;