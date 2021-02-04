import React, { useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import UserContext from '../../context/UserContext';
import Requete from '../../middlewares/Requete';

import { DropdownSubmenu, NavDropdownMenu} from "react-bootstrap-submenu"; // Permet d'avoir des sous menus dans les dropdowns. La navbar est en commentaire

export default function Header(){

    const history = useHistory();
    const { userData, setUserData } = useContext(UserContext);
    let from = "nowhere";

    return(
        <Navbar className="color-nav" collapseOnSelect expand="lg" bg="dark" variant="dark" fixed="top">
            <Navbar.Brand><Link className="home-link" to={"/"}>Plaine Mobilité</Link></Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
            <AuthOption />
            </Navbar.Collapse>
        </Navbar>
    )

    function AuthOption(){

        // Fonction de la navbar des non connectés
        const Register = function(){history.push("/inscription")};
        const Login = function(){history.push("/connexion")};

        // Fonctions de la navbar des admins
        const AfficherMembres = function(){history.push("/admin/membres/afficher-tous/" + from)};
        const AfficherAdmins = function(){history.push("/admin/admins/afficher-tous/" + from)};
        const CommunesEntreprises = function(){history.push("/admin/communes-entreprises/gerer")};
        const ConducteursPassagers = function(){history.push("/admin/conducteurs-passagers/gerer")};
        const Departs = function(){history.push("/admin/departs/gerer")};
        const Destinations = function(){history.push("/admin/destinations/gerer")};
        const Quartier = function(){history.push("/admin/quartier/gerer")};
        const Heures = function(){history.push("/admin/heures/gerer")};
        const Minutes = function(){history.push("/admin/minutes/gerer")};
        const ModePaiement = function(){history.push("/admin/modes-paiement/gerer")};
        const NombrePlacesPassagers = function(){history.push("/admin/nombre-places-passagers/gerer")};
        const MotifsRefusDemandesCovoiturage = function(){history.push("/admin/motif-suite-refus-demande-de-covoiturage/gerer")};
        const AfficherNotifications = function(){history.push("/admin/notifications/afficher-toutes")};
        const TypeActualite = function(){history.push("/admin/type-actualite/gerer")};
        const AfficherActualites = function(){history.push("/admin/actualites/afficher-toutes")};
        const AfficherStatistiques = function(){history.push("/admin/statistiques")};
        const AfficherFAQ = function(){history.push("/admin/faq/gerer")};

        // Fonctions de la navbar des connectés (admins compris)
        // const AfficherMonProfil = function(){history.push("/membre/" + userData.membre.id)};
        const AfficherToutMonProfil = function(){history.push("/membre/" + userData.membre.id)}
        const MesConversationsIndividuelles = ()=>{history.push("/mesconversations-individuelles/" + userData.membre.id)}
        const MatchingAller = async function(){
            let membreId = userData.membre.id;
            let membrePrenom = userData.membre.prenom;
            let page = "matching aller";
            const nouveauMatching = { membreId, membrePrenom, page };
            await Requete.post(
                "/statNavigation/nouveauPassage",
                nouveauMatching
            );
            history.push("/matching/aller/" + userData.membre.id);
        }
        const MatchingRetour = async function(){
            let membreId = userData.membre.id;
            let membrePrenom = userData.membre.prenom;
            let page = "matching retour";
            const nouveauMatching = { membreId, membrePrenom, page };
            await Requete.post(
                "/statNavigation/nouveauPassage",
                nouveauMatching
            );
            history.push("/matching/retour/" + userData.membre.id);
        }
        const Train = async function(){
            let membreId = userData.membre.id;
            let membrePrenom = userData.membre.prenom;
            let page = "train";
            const nouvelleNavigation = { membreId, membrePrenom, page };
            await Requete.post(
                "/statNavigation/nouveauPassage",
                nouvelleNavigation
            );
            history.push("/train")
        }
        const Bus = async function(){
            let membreId = userData.membre.id;
            let membrePrenom = userData.membre.prenom;
            let page = "bus";
            const nouvelleNavigation = { membreId, membrePrenom, page };
            await Requete.post(
                "/statNavigation/nouveauPassage",
                nouvelleNavigation
            );
            history.push("/bus")
        }
        const Velo = async function(){
            let membreId = userData.membre.id;
            let membrePrenom = userData.membre.prenom;
            let page = "velo";
            const nouvelleNavigation = { membreId, membrePrenom, page };
            await Requete.post(
                "/statNavigation/nouveauPassage",
                nouvelleNavigation
            );
            history.push("/velo")
        }
        const MovIci = async function(){
            let membreId = userData.membre.id;
            let membrePrenom = userData.membre.prenom;
            let page = "MovIci";
            const nouvelleNavigation = { membreId, membrePrenom, page };
            await Requete.post(
                "/statNavigation/nouveauPassage",
                nouvelleNavigation
            );
            history.push("/mov-ici")
        }
        const AfficherDemandesCovoiturageEnvoyees = ()=>{history.push("/demandesCovoiturages/envoyees/en-cours/" + userData.membre.id)}
        const MesCovoiturages = ()=>{history.push("/mesCovoiturages/" + userData.membre.id)}
        const Faq = ()=>{history.push("/FAQ/afficher-toutes")}
        const logout = function(){
          setUserData({
              token: undefined,
              membre: undefined,
          });
          localStorage.setItem("auth-token", "");
          localStorage.setItem("id-pour-notifications", "");
          history.push("/");
        };
    
        if(userData.membre){
            return(
                <>
                <Nav className="mr-auto">
                </Nav>
                <Nav>
                {userData.membre.test && (
                    <NavDropdownMenu title="Admin" id="collasible-nav-dropdown" alignRight>
                        <NavDropdown.Item onClick={AfficherMembres}>Afficher tous les membres</NavDropdown.Item>
                        <NavDropdown.Item onClick={AfficherAdmins}>Afficher tous les administrateurs</NavDropdown.Item>
                        <NavDropdown.Item onClick={AfficherNotifications}>Afficher les notifications</NavDropdown.Item>
                        <NavDropdown.Item onClick={AfficherActualites}>Actualités du site</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <DropdownSubmenu title="Gérer les contenu des menus déroulant">
                            <NavDropdown.Item onClick={CommunesEntreprises}>Communes d'entreprises</NavDropdown.Item>
                            <NavDropdown.Item onClick={Departs}>Départs</NavDropdown.Item>
                            <NavDropdown.Item onClick={Destinations}>Destinations</NavDropdown.Item>
                            <NavDropdown.Item onClick={Quartier}>Quartiers pour départs/destination</NavDropdown.Item>
                            <NavDropdown.Item onClick={Heures}>Heures</NavDropdown.Item>
                            <NavDropdown.Item onClick={Minutes}>Minutes</NavDropdown.Item>
                            <NavDropdown.Item onClick={ModePaiement}>Moyens de paiement</NavDropdown.Item>
                            <NavDropdown.Item onClick={ConducteursPassagers}>Type de conducteur/passager</NavDropdown.Item>
                            <NavDropdown.Item onClick={NombrePlacesPassagers}>Nombre de places possible pour les passagers</NavDropdown.Item>
                            <NavDropdown.Item onClick={MotifsRefusDemandesCovoiturage}>Motifs de refus de covoiturage</NavDropdown.Item>
                            <NavDropdown.Item onClick={TypeActualite}>Type d'actualités</NavDropdown.Item>
                        </DropdownSubmenu>
                        <NavDropdown.Divider />
                        <NavDropdown.Item onClick={AfficherFAQ}>FAQ</NavDropdown.Item>
                        <NavDropdown.Item onClick={AfficherStatistiques}>Statistiques</NavDropdown.Item>
                    </NavDropdownMenu>  
                )}
                <NavDropdown title={userData.membre.prenom} id="collasible-nav-dropdown">
                    <NavDropdown.Item onClick={AfficherToutMonProfil}>Profil</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={MesConversationsIndividuelles}>Messages</NavDropdown.Item>
                </NavDropdown>  
                <NavDropdown title="Covoiturage planifié" id="collasible-nav-dropdown">
                    <NavDropdown.Item onClick={MatchingAller}>Trouver un conducteur/passager pour l'aller</NavDropdown.Item>
                    <NavDropdown.Item onClick={MatchingRetour}>Trouver un conducteur/passager pour le retour</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={MesCovoiturages}>Mes covoiturages</NavDropdown.Item>
                    <NavDropdown.Item onClick={AfficherDemandesCovoiturageEnvoyees}>Mes demandes de covoiturages</NavDropdown.Item>
                </NavDropdown>
                    <Nav.Link onClick={Train}>Train</Nav.Link>
                    <Nav.Link onClick={Bus}>Bus</Nav.Link>
                    <Nav.Link onClick={Velo}>Vélo</Nav.Link>
                    <Nav.Link onClick={MovIci}>Mov'Ici</Nav.Link>
                    <Nav.Link onClick={Faq}>FAQ</Nav.Link>
                <Nav.Link onClick={logout}>Déconnexion</Nav.Link>
                </Nav>
                </>
            )
        }
        if(!userData.membre){
            return(
                <>
                <Nav className="mr-auto"></Nav>
                <Nav>
                    <Nav.Link onClick={Register}>Inscription</Nav.Link>
                    <Nav.Link onClick={Login}>Connexion</Nav.Link>
                </Nav>
                </>
            )
        }
    }
}