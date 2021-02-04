import React, { useState, useEffect } from 'react'; // useEffect permet d'avoir des interactions avec ce qui se passe en dehors du component
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import './scss/custom.scss';
import './App.css';
// import "bootstrap/dist/css/bootstrap.min.css"; // Eu par npm install bootstrap

import UserContext from './context/UserContext';
import Requete from './middlewares/Requete';
import Header from './components/navbar/Header';

// Imports pour la page d'acceuil
import Home from './components/home/Home';

// Imports pour les membres
import Register from './components/membres/Register';
import RegisterPart2 from './components/membres/Register.part2';
import Login from './components/membres/Login';
import VerifierMotDePasse from './components/membres/VerifierMotDePasseAvantModifProfil';
import ModifierMembre from './components/membres/Modifier';
import ModifierDisponibilite from './components/membres/ModifierDisponibilite';
import LeProfilEstIlComplet from './components/membres/ProfilEstIlComplet';
// Tests pour l'affichage de toutes les données du profil
import AfficherToutLeProfil from './components/membres/afficherMembre/AfficherTout';
import AfficherProfilPartielPassager from './components/membres/profilPartiel/AfficherProfilPassager';
import AfficherProfilPartielConducteur from './components/membres/profilPartiel/AfficherProfilConducteur';

// Imports pour les trajets aller
import CreerAller from './components/trajets/aller/Creer';
import ModifierAller from './components/trajets/aller/Modifier';
// import AfficherTrajetsAllerDunMembre from './components/trajets/aller/Afficher';
import CreerNouvelAller from './components/trajets/aller/NouveauTrajet';
import SupprimerUnOuPlusieursTrajetsAller from './components/trajets/aller/Supprimer'

// Imports pour les trajets retour
import CreerRetour from './components/trajets/retour/Creer';
import ModifierRetour from './components/trajets/retour/Modifier';
import CreerNouveauRetour from './components/trajets/retour/NouveauTrajet';
import SupprimerUnOuPlusieursTrajetsRetour from './components/trajets/retour/Supprimer';

// Imports pour les matching
import MatchingAller from './components/matching/aller/TrouverAller';
import MatchedProfilAller from './components/matching/aller/MatchedProfilAller';
import MatchingRetour from './components/matching/retour/TrouverRetour';
import MatchedProfilRetour from './components/matching/retour/MatchedProfilRetour';

// Imports pour les demandes de covoiturage
import AfficherDemandesCovoiturageEnvoyeesEncours from './components/demandesCovoiturage/envoyees/AfficherEnCours';
import AfficherDemandesCovoiturageEnvoyeesRefusees from './components/demandesCovoiturage/envoyees/AfficherRefusees';
import AfficherDemandesCovoiturageEnvoyeesAcceptees from './components/demandesCovoiturage/envoyees/AfficherAcceptees';
import SupprimerDemandeCovoiturage from './components/demandesCovoiturage/envoyees/Supprimer';
import AfficherDemandesCovoiturageRecues from './components/demandesCovoiturage/recues/Afficher';
import ProfilPartielSuiteDemandeCovoiturage from './components/demandesCovoiturage/envoyees/ProfilPartielSuiteDemandeCovoiturage';
import MotifSuiteRefusDemandeDeCovoiturage from './components/demandesCovoiturage/recues/MotifSuiteRefus';
import MessageSuiteAccordDemandeCovoiturage from './components/demandesCovoiturage/recues/MessageSuiteAccord';
import AfficherDemandesRefuseesSuiteNotification from './components/notifications/RefusCovoiturage';
import AfficherDemandesAccepteesSuiteNotification from './components/notifications/AccordCovoiturage';
import AfficherMessageAccordCovoiturageSuiteNotification from './components/conversations/suiteNotificationAccordCovoiturage/AfficherMessage';
import EcrireMessageSuiteNotification from './components/conversations/suiteNotificationAccordCovoiturage/EcrireMessage';

// Imports pour afficher les covoiturages
import MesCovoiturages from './components/mesCovoiturages/Afficher';
import JeSuisPassagerAfficherUnCovoiturage from './components/mesCovoiturages/enTantQuePassager/AfficherUn';
import JeSuisPassagerQuitterUnCovoiturage from './components/mesCovoiturages/enTantQuePassager/QuitterUn';
import JeSuisConducteurAfficherTousMesCovoituragesAvecUnPassager from './components/mesCovoiturages/enTantQueConducteur/AfficherCovoituragesAvecUnPassager';
import JeSuisPassagerAfficherTousMesCovoituragesAvecUnConducteur from './components/mesCovoiturages/enTantQuePassager/AfficherCovoituragesAvecUnConducteur';
import AfficherDetailTrajet from './components/mesCovoiturages/enTantQueConducteur/AfficherDetailTrajet';

// Import pour les notifications
import AfficherNotification from './components/notifications/Afficher';
import AfficherContenuNotificationQuitteCovoiturage from './components/notifications/QuitteUnCovoiturage';

//Imports pour les conversations individuelles
import EcrireMessageAPartirProfilPartiel from './components/conversations/conversationsIndividuelles/aPartirProfilPartiel/EcrireUnMessage';
import AfficherToutesMesConversationsIndividuelles from './components/conversations/conversationsIndividuelles/aPartirNavBar/AfficherToutes';
import EcrireMessageDepuisNavbar from './components/conversations/conversationsIndividuelles/aPartirNavBar/EcrireUnMessage';

// Imports pour les motifs de refus de demande de covoiturage
import AfficherMotifsRefusDemandeDeCovoiturage from './components/admin/motifsRefusDemandeCovoiturage/Afficher';
import AjouterMotifsRefusDemandeDeCovoiturage from './components/admin/motifsRefusDemandeCovoiturage/Ajouter';
import ModifierMotifsRefusDemandeDeCovoiturage from './components/admin/motifsRefusDemandeCovoiturage/Modifier';
import SupprimerMotifsRefusDemandeDeCovoiturage from './components/admin/motifsRefusDemandeCovoiturage/Supprimer';

// Imports pour les admins

// Imports pour les communes d'entreprises
import AfficherCommune from './components/admin/communesEntreprises/Afficher';
import AjouterCommune from './components/admin/communesEntreprises/Ajouter';
import ModifierCommune from './components/admin/communesEntreprises/Modifier';
import SupprimerCommune from './components/admin/communesEntreprises/Supprimer';

// Imports pour les conducteurs/passagers
import AfficherConducteurPassager from './components/admin/conducteurPassager/Afficher';
import AjouterConducteurPassager from './components/admin/conducteurPassager/Ajouter';
import ModifierConducteurPassager from './components/admin/conducteurPassager/Modifier';
import SupprimerConducteurPassager from './components/admin/conducteurPassager/Supprimer';

// Imports pour les départs
import AfficherDepart from './components/admin/departs/Afficher';
import AjouterDepart from './components/admin/departs/Ajouter';
import ModifierDepart from './components/admin/departs/Modifier';
import SupprimerDepart from './components/admin/departs/Supprimer';

// Imports pour les destinations
import AfficherDestination from './components/admin/destinations/Afficher';
import AjouterDestination from './components/admin/destinations/Ajouter';
import ModifierDestination from './components/admin/destinations/Modifier';
import SupprimerDestination from './components/admin/destinations/Supprimer';

// Imports pour les quartiers
import AfficherDepartsDestinationsPourAjoutQuartier from './components/admin/quartier/AfficherDepartsDestinations';
import AjouterQuartier from './components/admin/quartier/Ajouter';
import ModifierQuartier from './components/admin/quartier/Modifier';
import SupprimerQuartier from './components/admin/quartier/Supprimer';

// Imports pour la gestion des membres par les administrateurs
import AfficherTousLesMembres from './components/admin/gestionMembres/afficherLesMembres';
import AfficherTousLesAdmins from './components/admin/gestionMembres/afficherLesAdmins';
import AfficherTousLesConducteurs from './components/admin/gestionMembres/AfficherConducteurs';
import AfficherTousLesConducteursEtPassagers from './components/admin/gestionMembres/AfficherConducteursEtPassagers';
import AfficherTousLesPassagersEtConducteurs from './components/admin/gestionMembres/AfficherPassagersEtConducteurs';
import AfficherTousLesPassagers from './components/admin/gestionMembres/AfficherPassagers';
import AfficherTousLesIndisponibles from './components/admin/gestionMembres/AfficherIndisponible';
import AfficherTousLesMembre1EtapeInscription from './components/admin/gestionMembres/Afficher1EtapeInscription';
import AfficherTousLesMembre2EtapesInscription from './components/admin/gestionMembres/Afficher2EtapesInscription';

import CreerAdmin from './components/admin/gestionMembres/CreerAdmin';
import AfficherAdmin from './components/admin/gestionMembres/DetailAdmin';
import SupprimerAdmin from './components/admin/gestionMembres/SupprimerAdmin';

// Import pour les heures
import AfficherHeure from './components/admin/heures/Afficher';
import AjouterHeure from './components/admin/heures/Ajouter';
import ModifierHeure from './components/admin/heures/Modifier';
import SupprimerHeure from './components/admin/heures/Supprimer';

// Imports pour les minutes
import AfficherMinute from './components/admin/minutes/Afficher';
import AjouterMinute from './components/admin/minutes/Ajouter';
import ModifierMinute from './components/admin/minutes/Modifier';
import SupprimerMinute from './components/admin/minutes/Supprimer';

// Imports pour les modes de paiement
import AfficherModePaiement from './components/admin/modePaiement/Afficher';
import AjouterModePaiement from './components/admin/modePaiement/Ajouter';
import ModifierModePaiement from './components/admin/modePaiement/Modifier';
import SupprimerModePaiement from './components/admin/modePaiement/Supprimer';

// Imports pour le nombres de places possibles dans un véhicule
import AfficherNombrePlacesPassagers from './components/admin/nombrePlacesPassagers/Afficher';
import AjouterNombrePlacesPassagers from './components/admin/nombrePlacesPassagers/Ajouter';
import ModifierNombrePlacesPassagers from './components/admin/nombrePlacesPassagers/Modifier';
import SupprimerNombrePlacesPassagers from './components/admin/nombrePlacesPassagers/Supprimer';

// Imports pour les notifications
import AdminAfficherDetailNotificationCovoiturage from './components/admin/notifications/AfficherDetail';
import AfficherNotificationsToutes from './components/admin/notifications/AfficherToutes';
import AfficherNotificationsNonVues from './components/admin/notifications/AfficherNonVues';
import AfficherNotificationsVues from './components/admin/notifications/AfficherVues';
import AfficherNotificationsOuvertes from './components/admin/notifications/AfficherOuvertes';

// import pour le menu déroulant du type d'activité
import AjouterTypeActualite from './components/admin/actualite/menuDeroulantTypeActualite/Ajouter';
import ModifierTypeActualite from './components/admin/actualite/menuDeroulantTypeActualite/Modifier';
import SupprimerTypeActualite from './components/admin/actualite/menuDeroulantTypeActualite/Supprimer';

// Imports pour les actualités
import AjouterActualite from './components/admin/actualite/Ajouter';
import ModifierActualite from './components/admin/actualite/Modifier';
import SupprimerActualite from './components/admin/actualite/Supprimer';

// Imports pour les statistiques
import AffichezToutesLesStatistiques from './components/admin/statistiques/Toutes';
import StatistiquesAdministrateur from './components/admin/statistiques/utilisateurs/Administrateurs';
import AfficherDetailTousLesTrajetsAller from './components/admin/statistiques/trajets/aller/trajetsAllerDetail/AfficherDetail';
import AfficherDetailTrajetsAllerDepart from './components/admin/statistiques/trajets/aller/trajetsAllerDetail/AfficherTrajetAllerDepart';
import AfficherDetailTrajetsAllerDestination from './components/admin/statistiques/trajets/aller/trajetsAllerDetail/AfficherTrajetAllerDestination';
import AfficherDetailTousLesTrajetsRetour from './components/admin/statistiques/trajets/retour/trajetsRetourDetail/AfficherDetail';
import AfficherDetailTrajetsRetourDepart from './components/admin/statistiques/trajets/retour/trajetsRetourDetail/AfficherTrajetRetourDepart';
import AfficherDetailTrajetsRetourDestination from './components/admin/statistiques/trajets/retour/trajetsRetourDetail/AfficherTrajetRetourDestination';
import StatistiquesDemandesCovoiturage from './components/admin/statistiques/demandesCovoiturages/demandesDetail/AfficherDetailDemandeCovoit';

// Imports pour les FAQ
import AdminCreerSujetFAQ from './components/admin/faq/CreerFAQ';
import AdminAjouterParagrapheFAQ from './components/admin/faq/AjouterParagrapheFAQ';
import ModifierParagrapheFAQ from './components/admin/faq/ModifierParagraphe';
import SupprimerParagraphe from './components/admin/faq/SupprimerParagraphe';
import ModifierFAQ from './components/admin/faq/ModifierFAQ';
import SupprimerFAQ from './components/admin/faq/SupprimerFAQ';
import AdminAfficherUneFAQ from './components/admin/faq/AfficherUne';
import AfficherToutesFAQ from './components/faq/AfficherToutes';
import AfficherUneFAQ from './components/faq/AfficherUne';

// imports pour les pages en cours de construction
import PageConstructionTrain from './components/train/afficherPageConstruction';
import PageConstructionVelo from './components/velo/afficherPageConstruction';
import PageConstructionBus from './components/bus/afficherPageConstruction';
import PageConstructionMovIci from './components/movIci/afficherPageConstruction';

// Imports pour les conversations avec un administrateur
import EcrireMessageConversationAdministrateur from './components/conversations/conversationsAvecAdministrateur/EcrireMessage';

export default function App(){
  const [userData, setUserData] = useState({
    userData: undefined,
    setUserData: undefined,
  });

  useEffect(function(){ // Quand l'application se lancera, useEffect sera tout de suite utilisée

    const checkLoggedIn = async function(){ // useEffect est une fonction synchrone, mais comme le backend est asynchrone, il faut une fonction asynchrone
      let token = localStorage.getItem("auth-token");
      if(token === null){ // S'il n'y a pas de token dans le local storage, cela crée une erreur. Avec ce if, cela nous permet de lui attribuer une valeur et d'éviter une erreur s'il est null
        localStorage.setItem("auth-token", "");
        token = "";
      }

      const tokenRes = await Requete.post(
        "/membres/tokenValide",
        null, //on rajoute null car la requête est un post et que le body est vide
        { headers: { "x-auth-token": token } }
      );
      if(tokenRes.data){ // Si le token est valide, on récupère les données du membre
        const membreRes = await Requete.get(
          "/membres/",
          { headers: { "x-auth-token": token } },
        );
        setUserData({ // Comme on a vérifié le token auparavant, on sait que l'on trouvera un membre
          token,
          membre: membreRes.data,
        });
       }

    }
    checkLoggedIn();
  
  }, []);
  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={{ userData, setUserData }}> {/*UserContext provider peut accéder aux données du membre pour tous les components inclus entre les 2 balises UserContext et de les modifier*/}
          <Header />
          <Switch>
            <Route exact path='/' component={Home} />
            
            <Route exact path="/inscription" component={Register} />
            <Route path='/inscription/part2/:id' component={RegisterPart2} />
            <Route path='/connexion' component={Login} />
            <Route path="/membres/verifier-mdp/:id" component={VerifierMotDePasse} />
            <Route path='/modifier/membre/:id' component={ModifierMembre} />
            <Route path="/membres/disponible/:id" component={ModifierDisponibilite} />
            <Route path='/membres/a-completer/:id' component={LeProfilEstIlComplet} />
            <Route path='/mesCovoiturages/passager/profil-partiel/:passagerId/:membreId' component={AfficherProfilPartielPassager} />
            <Route path='/mesCovoiturages/conducteur/profil-partiel/:conducteurId/:membreId' component={AfficherProfilPartielConducteur} />

            <Route path="/membre/:id" component={AfficherToutLeProfil} />

            <Route path="/aller/creer/:id" component={CreerAller} />
            <Route path="/trajet/aller/modifier/:id/:membre/:paramsDepart/:paramsDestination" component={ModifierAller} />
            <Route path="/nouveau-trajet/aller/:id" component={CreerNouvelAller} />
            <Route path="/trajet/aller/supprimer/:id" component={SupprimerUnOuPlusieursTrajetsAller} />

            <Route path="/retour/creer/:id" component={CreerRetour} />
            <Route path="/trajet/retour/modifier/:id/:membre/:paramsDepart/:paramsDestination" component={ModifierRetour} />
            <Route path="/nouveau-trajet/retour/:id" component={CreerNouveauRetour} />
            <Route path="/trajet/retour/supprimer/:id" component={SupprimerUnOuPlusieursTrajetsRetour} />

            <Route exact path="/matching/aller/:id" component={MatchingAller} />
            <Route path="/matching/aller/profil/:id/:membreId" component={MatchedProfilAller} />
            <Route exact path="/matching/retour/:id" component={MatchingRetour} />
            <Route path="/matching/retour/profil/:id/:membreId" component={MatchedProfilRetour} />

            <Route path="/demandesCovoiturages/envoyees/en-cours/:id" component={AfficherDemandesCovoiturageEnvoyeesEncours} />
            <Route path="/demandesCovoiturages/envoyees/refusees/:id" component={AfficherDemandesCovoiturageEnvoyeesRefusees} />
            <Route path="/demandesCovoiturages/envoyees/acceptees/:id" component={AfficherDemandesCovoiturageEnvoyeesAcceptees} />
            <Route path="/demandesCovoiturages/supprimer/:id" component={SupprimerDemandeCovoiturage} />
            <Route path="/demandesCovoiturages/recues/:id/:aller_ou_retour" component={AfficherDemandesCovoiturageRecues} />
            <Route path="/profil/partiel/:id/:membreId" component={ProfilPartielSuiteDemandeCovoiturage} />
            <Route path="/motif-suite-refus-demande-de-covoiturage/indiquer/:id/:aller_ou_retour/:nbre_refus" component={MotifSuiteRefusDemandeDeCovoiturage} />
            <Route path="/message-suite-accord-demande-covoiturage/:id/:aller_ou_retour/:prenom" component={MessageSuiteAccordDemandeCovoiturage} />
            <Route path="/demandesCovoiturages/notification/refus/:id/:aller_ou_retour" component={AfficherDemandesRefuseesSuiteNotification} />
            <Route path="/demandesCovoiturages/notification/accord/:id/:aller_ou_retour" component={AfficherDemandesAccepteesSuiteNotification} />
            <Route path="/demandesCovoiturages/notification/message/accord/:id" component={AfficherMessageAccordCovoiturageSuiteNotification} />
            <Route path="/conversation/notification/message/:messageId/:membreId" component={EcrireMessageSuiteNotification} />

            <Route path="/mesCovoiturages/:id" component={MesCovoiturages} />
            <Route path="/monCovoiturage/afficher-un/:id/:jour/:aller_ou_retour" component={JeSuisPassagerAfficherUnCovoiturage} />
            <Route path="/mesCovoiturage/quitter-un/:membreId/:equipageId/:jour/:aller_ou_retour" component={JeSuisPassagerQuitterUnCovoiturage} />
            <Route path="/tous-mes-covoiturage-avec-un-passager/:passagerId/:conducteurId/:prenom" component={JeSuisConducteurAfficherTousMesCovoituragesAvecUnPassager} />
            <Route path="/tous-mes-covoiturage-avec-un-conducteur/:passagerId/:conducteurId/:prenom/:vientDe" component={JeSuisPassagerAfficherTousMesCovoituragesAvecUnConducteur} />
            <Route path="/trajet/detail/equipage/:trajetId/:id" component={AfficherDetailTrajet} />

            <Route path="/notifications/afficher" component={AfficherNotification} />
            <Route path="/notifications/finCovoiturage/:notificationId/:prenom" component={AfficherContenuNotificationQuitteCovoiturage} />
            <Route path="/admin/notifications/afficher-toutes" component={AfficherNotificationsToutes} />
            <Route path="/admin/notifications/afficher-non-vues" component={AfficherNotificationsNonVues} />
            <Route path="/admin/notifications/afficher-vues" component={AfficherNotificationsVues} />
            <Route path="/admin/notifications/afficher-ouvertes" component={AfficherNotificationsOuvertes} />
            <Route path="/admin/notification/covoiturage/detail/:id/:allerOuRetour/:origine" component={AdminAfficherDetailNotificationCovoiturage} />

            <Route path="/conversation-individuelle/envoyer/:destinataireId/:membreId" component={EcrireMessageAPartirProfilPartiel} />
            <Route path="/mesconversations-individuelles/:id" component={AfficherToutesMesConversationsIndividuelles} />
            <Route path="/conversation/:conversationId/:membreId" component={EcrireMessageDepuisNavbar} />

            <Route path="/conversation-avec-admin/:membreId" component={EcrireMessageConversationAdministrateur} />

            <Route path="/FAQ/afficher-toutes" component={AfficherToutesFAQ} />
            <Route path="/faq/afficher-une/:faqId" component={AfficherUneFAQ} />

            <Route path='/admin/communes-entreprises/gerer' component={AjouterCommune} />
            <Route path='/admin/communes-entreprises/afficher' component={AfficherCommune} />
            <Route path='/admin/communes-entreprises/modifier/:id' component={ModifierCommune} />
            <Route path='/admin/communes-entreprises/supprimer/:id' component={SupprimerCommune} />

            <Route path="/admin/conducteurs-passagers/gerer" component={AjouterConducteurPassager} />
            <Route path="/admin/conducteurs-passagers/afficher" component={AfficherConducteurPassager} />
            <Route path="/admin/conducteurs-passagers/modifier/:id" component={ModifierConducteurPassager} />
            <Route path="/admin/conducteurs-passagers/supprimer/:id" component={SupprimerConducteurPassager} />

            <Route path='/admin/departs/gerer' component={AjouterDepart} />
            <Route path='/admin/departs/afficher' component={AfficherDepart} />
            <Route path='/admin/departs/modifier/:id' component={ModifierDepart} />
            <Route path='/admin/departs/supprimer/:id' component={SupprimerDepart} />

            <Route path='/admin/destinations/gerer' component={AjouterDestination} />
            <Route path='/admin/destinations/afficher' component={AfficherDestination} />
            <Route path="/admin/destinations/modifier/:id" component={ModifierDestination} />
            <Route path="/admin/destinations/supprimer/:id" component={SupprimerDestination} />

            <Route path="/admin/quartier/gerer" component={AfficherDepartsDestinationsPourAjoutQuartier} />
            <Route path="/admin/quartier/ajouter/:departOuDestination/:id" component={AjouterQuartier} />
            <Route path="/admin/quartier/modifier/:quartierId/:departOuDestination/:zoneId" component={ModifierQuartier} />
            <Route path="/admin/quartier/supprimer/:quartierId/:departOuDestination/:zoneId" component={SupprimerQuartier} />

            <Route path="/admin/membres/afficher-tous/:from" component={AfficherTousLesMembres} />
            <Route path="/admin/admins/afficher-tous/:from" component={AfficherTousLesAdmins} />
            <Route path="/admin/membres/conducteurs" component={AfficherTousLesConducteurs} />
            <Route path="/admin/membres/conducteurs-et-passagers" component={AfficherTousLesConducteursEtPassagers} />
            <Route path="/admin/membres/passagers-et-conducteurs" component={AfficherTousLesPassagersEtConducteurs} />
            <Route path="/admin/membres/passagers" component={AfficherTousLesPassagers} />
            <Route path="/admin/membres/indisponibles" component={AfficherTousLesIndisponibles} />
            <Route path="/admin/membre/1-etape" component={AfficherTousLesMembre1EtapeInscription} />
            <Route path="/admin/membre/2-etapes" component={AfficherTousLesMembre2EtapesInscription} />

            <Route path="/admin/450754/ajouter-admin/6532467899" component={CreerAdmin} />
            <Route path="/admin/admins/afficher-un/:adminId/:from" component={AfficherAdmin} />
            <Route path="/admin/admins/supprimer/:adminId" component={SupprimerAdmin} />

            <Route path="/admin/heures/afficher" component={AfficherHeure} />
            <Route path="/admin/heures/gerer" component={AjouterHeure} />
            <Route path="/admin/heures/modifier/:id" component={ModifierHeure} />
            <Route path="/admin/heures/supprimer/:id" component={SupprimerHeure} />

            <Route path="/admin/minutes/gerer" component={AjouterMinute} />
            <Route path="/admin/minutes/afficher" component={AfficherMinute} />
            <Route path="/admin/minutes/modifier/:id" component={ModifierMinute} />
            <Route path="/admin/minutes/supprimer/:id" component={SupprimerMinute} />

            <Route path="/admin/modes-paiement/gerer" component={AjouterModePaiement} />
            <Route path="/admin/modes-paiement/afficher" component={AfficherModePaiement} />
            <Route path="/admin/modes-paiement/modifier/:id" component={ModifierModePaiement} />
            <Route path="/admin/modes-paiement/supprimer/:id" component={SupprimerModePaiement} />

            <Route path="/admin/nombre-places-passagers/gerer" component={AjouterNombrePlacesPassagers} />
            <Route path="/admin/nombre-places-passagers/afficher" component={AfficherNombrePlacesPassagers} />
            <Route path="/admin/nombre-places-passagers/modifier/:id" component={ModifierNombrePlacesPassagers} />
            <Route path="/admin/nombre-places-passagers/supprimer/:id" component={SupprimerNombrePlacesPassagers} />

            <Route path="/admin/motif-suite-refus-demande-de-covoiturage/gerer" component={AjouterMotifsRefusDemandeDeCovoiturage} />
            <Route path="/admin/motif-suite-refus-demande-de-covoiturage/afficher" component={AfficherMotifsRefusDemandeDeCovoiturage} />
            <Route path="/admin/motif-suite-refus-demande-de-covoiturage/modifier/:id" component={ModifierMotifsRefusDemandeDeCovoiturage} />
            <Route path="/admin/motif-suite-refus-demande-de-covoiturage/:id" component={SupprimerMotifsRefusDemandeDeCovoiturage} />

            <Route path="/admin/type-actualite/gerer" component={AjouterTypeActualite} />
            <Route path="/admin/type-actualite/supprimer/:id" component={SupprimerTypeActualite} />
            <Route path="/admin/type-actualite/modifier/:id" component={ModifierTypeActualite} />

            <Route path="/admin/actualites/afficher-toutes" component={AjouterActualite} />
            <Route path="/admin/actualitee/modifier/:actualiteId" component={ModifierActualite} />
            <Route path="/admin/actualitee/supprimer/:actualiteId" component={SupprimerActualite} />

            <Route path="/admin/statistiques" component={AffichezToutesLesStatistiques} />
            <Route path="/admin/tests/statistiques" component={StatistiquesAdministrateur} />
            <Route path="/admin/trajetsAller/:detail" component={AfficherDetailTousLesTrajetsAller} />
            <Route path="/admin/aller/depart/:nom" component={AfficherDetailTrajetsAllerDepart} />
            <Route path="/admin/aller/destination/:nom" component={AfficherDetailTrajetsAllerDestination} />
            <Route path="/admin/trajetsRetour/:detail" component={AfficherDetailTousLesTrajetsRetour} />
            <Route path="/admin/retour/depart/:nom" component={AfficherDetailTrajetsRetourDepart} />
            <Route path="/admin/retour/destination/:nom" component={AfficherDetailTrajetsRetourDestination} />
            <Route path="/admin/demandeCovoit/:type" component={StatistiquesDemandesCovoiturage} />

            <Route path="/admin/faq/gerer" component={AdminCreerSujetFAQ} />
            <Route path="/admin/faq/ajouter/paragraphe/:faqId" component={AdminAjouterParagrapheFAQ} />
            <Route path="/admin/paragraphe/modifier/:paragrapheId/:from/:faqId" component={ModifierParagrapheFAQ} />
            <Route path="/admin/paragraphe/supprimer/:paragrapheId/:from/:faqId" component={SupprimerParagraphe} />
            <Route path="/admin/faq/modifier/sujet/:faqId/:from" component={ModifierFAQ} />
            <Route path="/admin/faq/supprimer/sujet/:faqId/:from" component={SupprimerFAQ} />
            <Route path="/admin/faq/afficher-une/:faqId" component={AdminAfficherUneFAQ} />

            <Route path="/train" component={PageConstructionTrain} />
            <Route path="/velo" component={PageConstructionVelo} />
            <Route path="/bus" component={PageConstructionBus} />
            <Route path="/mov-ici" component={PageConstructionMovIci} />

          </Switch>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
}
