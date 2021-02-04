const router = require('express').Router(); // Execute la fonction Router()
const auth = require('../../middleware/auth'); // Permet d'utiliser le middleware auth qui vérifie que l'utilisateur est connecté
const adminAuth = require('../../middleware/adminAuth'); // Permet d'utiliser le middleware adminAuth qui vérifie que le membre est admin
const CommuneEntreprise = require('../../models/menuDeroulant/communeEntrepriseModel'); // Permet d'utiliser le model commune entreprise

router.post('/ajouter', adminAuth, async function(req, res){
    try {
        // Validation
        if(!req.body.nom){
            return res
                .status(400)
                .send({ msg: "La commune doit avoir un nom"});
        }

        const communeEntrepriseDoublon = await CommuneEntreprise.findOne({ nom: req.body.nom });
        if(communeEntrepriseDoublon){
            return res
                .status(400)
                .send({ msg: "Une commune d'entreprise existe déjà avec ce nom" });
        }

        let communeEntreprise = new CommuneEntreprise(req.body);

        const nouvelle_communeEntreprise = await communeEntreprise.save();
        res.json(nouvelle_communeEntreprise);
    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.delete('/supprimer/:id', adminAuth, async function(req, res){
    try{
        const supprimerCommuneEntreprise = await CommuneEntreprise.findByIdAndDelete(req.params.id);
        res.json(supprimerCommuneEntreprise);

    } catch (err){
        res.status(500).json({ error: err.message});
    }
});

router.get('/afficher', async function(req, res){
    try{

        const afficherCommunesEntreprises = await CommuneEntreprise.find().sort({ nom: 1 });
        res.json(afficherCommunesEntreprises);

    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

router.get('/afficher-une/:id', async function(req, res){
    try {
        const afficherUneCommuneEntreprise = await CommuneEntreprise.findById(req.params.id);
        res.json(afficherUneCommuneEntreprise);

    } catch(err){
        res.status(500).json({ error: err.message});
    }
});

router.put('/modifier/:id', adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.nom){
            return res
                .status(400)
                .send({ msg: "La commune doit avoir un nom"});
        }

        const communeEntrepriseDoublon = await CommuneEntreprise.findOne({ nom: req.body.nom });
        if(communeEntrepriseDoublon){
            return res
                .status(400)
                .send({ msg: "Une commune d'entreprise existe déjà avec ce nom" });
        }

        const modifierCommunesEntreprises = await CommuneEntreprise.findById(req.params.id, function(err, commune){
            if(!commune){
                res.status(400).send({ msg: "Commune non trouvée"});
            } else {
                commune.nom = req.body.nom;
                commune.save();
                res.json(commune);
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
});

module.exports = router;