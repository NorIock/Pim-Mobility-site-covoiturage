const jwt = require('jsonwebtoken');

const auth = function(req, res, next){

    try {
        const token = req.header("x-auth-token");

        if(!token){
            return res
                .status(401)
                .json({ msg: "Pas de token, accès refusé" });
        }

        const verifierToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!verifierToken){
            return res
                .status(401)
                .json({ msg: "Echec de la vérification du token, accès refusé"});
        }

        req.membre = verifierToken.id; // Dans la requête qui appelle le middleware, on aura déjà l'id
        next(); // Permettra d'executer tout ce qu'il y aura après

    } catch(err) {
        res.status(500).json({ error: err.message });
    }

};

module.exports = auth;