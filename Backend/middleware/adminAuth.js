const jwt = require('jsonwebtoken');

const adminAuth = function(req, res, next){

    try {
        const token = req.header("x-auth-token");
    
        if(!token){
            return res
                .status(401)
                .json({ msg: "Pas de token, accès refusée" });
        }
    
        const verifierToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!verifierToken){
            return res
                .status(401)
                .json({ msg: "Echec de la vérification du token, accès refusé"});
        }
        if(verifierToken.test !== true){ // Si le membre n'est pas admin, on bloque l'accès
            return res
                .status(401)
                .json({ msg:"Vous n'avez pas les droits pour effectuer cette requête"});
        } else {
            next(); // Permettra d'executer tout ce qu'il y aura après
        }
    
    } catch(err) {
        res.status(500).json({ error: err.message });
    }

};

module.exports = adminAuth;