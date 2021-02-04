const router = require("express").Router();
const adminAuth = require("../middleware/adminAuth");
const FAQSujet = require("../models/faqSujetModel");
const FAQParagraphe = require("../models/faqParagrapheModel");

// Cette route permet de créer un nouveau sujet pour la FAQ
router.post("/creerSujet", adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.sujet){
            return res
                .status(400)
                .send({ msg: "Veuillez indiquer un sujet"});
        }

        // On vérifie que ce sujet n'existe pas déjà
        const sujetExiste = await FAQSujet.findOne({ sujet: req.body.sujet });
        if(sujetExiste){
            return res
                .status(400)
                .send({ msg: "Une faq existe déjà avec ce sujet"});
        }

        let nouveauSujet = new FAQSujet({
            sujet: req.body.sujet,
        });

        await nouveauSujet.save();

        res.json(nouveauSujet);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Cette route permet de rajouter un paragraphe à une faq
router.post("/creerParagraphe/:sujetId", adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body){
            return res
                .status(400)
                .send({ msg: "Veuillez compléter le champ paragraphe" });
        };

        let nouveauParagraphe = new FAQParagraphe({
            paragraphe: req.body.paragraphe,
        });

        await nouveauParagraphe.save();

        // On récupère le sujet:
        const sujetFAQ = await FAQSujet.findById(req.params.sujetId);

        sujetFAQ.paragraphe.push(nouveauParagraphe);

        await sujetFAQ.save();
        res.json(sujetFAQ);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher toutes les FAQs
router.get("/afficher-toutes", async function(req, res){
    try{
        const afficherLesToutes = await FAQSujet.find();

        if(afficherLesToutes.length === 0){
            res.json("Queud");
        } else {
            res.json(afficherLesToutes);
        }

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher une faq
router.get("/afficher-une/:faqId", async function(req, res){
    try{
        const afficherFaq = await FAQSujet.findById(req.params.faqId).populate("paragraphe");

        res.json(afficherFaq);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet d'afficher le contenu d'un paragraphe avant de le modifier
router.get("/paragraphe/recuperer-pour-modif/:paragrapheId", adminAuth, async function(req, res){
    try{
        const recupererParagraphe = await FAQParagraphe.findById(req.params.paragrapheId);
        if(!recupererParagraphe){
            return res
                .status(400)
                .send({msg: "Paragraphe non trouvé"})
        };

        res.json(recupererParagraphe);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

// Permet de modifier un paragraphe
router.put("/paragraphe/modifier/:paragrapheId", adminAuth, async function(req, res){
    try{
        // Validations
        if(!req.body.paragraphe){
            return res
                .status(400)
                .send({ msg: "Veuillez écrire un paragraphe"});
        }

        const majParagraphe = await FAQParagraphe.findById(req.params.paragrapheId);

        if(!majParagraphe){
            return res
                .status(400)
                .send({msg: "Paragraphe non trouvé"})
        };

        majParagraphe.paragraphe = req.body.paragraphe;

        await majParagraphe.save();
        res.json(majParagraphe);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de supprimer un paragraphe
router.delete("/paragraphe/supprimer/:paragrapheId", adminAuth, async function(req, res){
    try{
        const supprimerParagraphe = await FAQParagraphe.findByIdAndDelete(req.params.paragrapheId);

        if(!supprimerParagraphe){
            return res
                .status(400)
                .send({msg: "Paragraphe non trouvé"})
        };

        // On retire le paragraphe supprimé de la FAQ
        const modifierSujetFAQ = await FAQSujet.findOne({ paragraphe: { $in: req.params.paragrapheId } } );

        modifierSujetFAQ.paragraphe.pull(req.params.paragrapheId);
   
        await modifierSujetFAQ.save();

        res.json(modifierSujetFAQ);

    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de modifier le sujet d'une FAQ
router.put("/sujet/modifier/:sujetId", adminAuth, async function(req, res){
    try{
        // Validation
        if(!req.body.sujet){
            return res
                .status(400)
                .send({ msg: "Veuillez écrire le nouveau sujet de la FAQ"});
        }

        const majSujet = await FAQSujet.findById(req.params.sujetId);

        if(!majSujet){
            return res
                .status(400)
                .send({msg: "Sujet non trouvé"})
        };

        majSujet.sujet = req.body.sujet;

        await majSujet.save();
        res.json(majSujet);


    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

// Permet de supprimer une FAQ
router.delete("/supprimer/:faqId", adminAuth, async function(req, res){
    try{
        const supprimerFAQ = await FAQSujet.findByIdAndDelete(req.params.faqId);

        // Maintenant on supprime aussi les paragraphes qui étaient liée à la FAQ
        for(paragraphesId of supprimerFAQ.paragraphe){

            await FAQParagraphe.findByIdAndDelete(paragraphesId);
        }

        res.json(supprimerFAQ);
        

    } catch(err){
        res.status(500).json({ error: err.message });
    }
})

module.exports = router;