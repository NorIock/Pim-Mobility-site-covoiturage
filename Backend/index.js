const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Permet d'enregister des variables d'environnements (dans le fichier .env)

const bodyParser = require('body-parser'); // Permet de découper les informations envoyées depuis le front pour être traitées par le back

// Configuration d'express:
const app = express(); // Permet d'utiliser express
app.use(express.json()); // Permet de lire les objets json des requêtes
app.use(cors()); // Permet d'utiliser cors

app.use( bodyParser.json() ); // Pour le support des JSON-encoded bodie
app.use(bodyParser.urlencoded({     // Pour le support des URL-encoded bodies
    extended: true
}));

const PORT = process.env.PORT || 5000 // Permettra, quand le site sera déployé, de mettre dans le fichier .env le PORT fourni par l'hébergeur. Sinon, le port 5000 pour le développement

app.listen(PORT, function(){
    console.log(`Le serveur s'est lancé sur le port: ${PORT}`);
});

// Confirguration de mongoose:
mongoose.connect(
    process.env.MONGODB_CONNECTION_STRING, // Permet de changer facilement l'adresse de la db lors du déploiement. Variable dabs fichier .env grâce à dotenv
     {
         useNewUrlParser: true,
         useUnifiedTopology: true, 
         useCreateIndex: true
        });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion'));
db.once('open', function(){
    console.log('Connecté à la base de donnée');
});

// Configuration des routes:
app.use("/membres", require("./routes/membreRouter")); // A chaque fois que l'on enverra une requête au back commançant par /membres, cela lancera le middlewarre membreRouter
app.use("/trajetsAller", require("./routes/trajetAllerRouter"));
app.use("/trajetsRetour", require("./routes/trajetRetourRouter"));
app.use("/matching", require("./routes/matchingRouter"));
app.use("/covoiturageDemande", require("./routes/demandeCovoiturageRouter"));
app.use("/notifications", require("./routes/notificationRouter"));
app.use("/discussionIndividuelle", require("./routes/discussionIndividuelleRouter"));
app.use("/mesCovoiturages", require("./routes/mesCovoituragesRouter"));
app.use("/actualites", require("./routes/pourAdmin/actualiteRouter"));
app.use("/statNavigation", require("./routes/pourAdmin/statNavigationRouter"));
app.use("/FAQ", require("./routes/faqRouter"));
app.use("/discussionAvecAdministrateur", require("./routes/discussionAdministrateurRouter"));
// Routes spécifiques à l'administrateur
app.use("/communesEntreprises", require("./routes/pourAdmin/communeEntrepriseRouter")); // A chaque fois que l'on enverra une requête au back commançant par /communesEntreprises, cela lancera le middlewarre communeEntrepriseRouter
app.use("/departs", require("./routes/pourAdmin/departRouter")); // A chaque fois que l'on enverra une requête au back commançant par /departs, cela lancera le middlewarre departRouter
app.use("/destinations", require("./routes/pourAdmin/destinationRouter")); // A chaque fois que l'on enverra une requête au back commançant par /destinations, cela lancera le middlewarre destinationsRouter
app.use("/modesPaiement", require("./routes/pourAdmin/modePaiementRouter"));
app.use("/conducteursPassagers", require("./routes/pourAdmin/conducteurPassagerRouter"));
app.use("/heures", require("./routes/pourAdmin/heureRouter"));
app.use("/minutes", require("./routes/pourAdmin/minuteRouter"));
app.use("/nombrePlacesPassagers", require("./routes/pourAdmin/nombrePlacesPassagersRouter"));
app.use("/motifsRefusDemandeDeCovoiturage", require("./routes/pourAdmin/motifRefusDemandeDeCovoiturageRouter"));
app.use("/quartier", require("./routes/pourAdmin/quartierRouter"));