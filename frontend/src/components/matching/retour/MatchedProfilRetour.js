import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import CheckBox from '../../../middlewares/CheckBox';
import ErrorNotice from '../../misc/ErrorNotice';

export default function MatchedProfilRetour(){

    const [data, setData] = useState([]); // Données du membre qui reçoit la demande de covoiturage
    const [demandeurData, setDemandeurData] = useState([]) // Données du membre qui envoie la demande de covoiturage. On en aura besoin pour comparer les rôles et agir s'ils ont le même rôle hybride afin d'ofrir le choix d'une demande en tant que conducteur ou passager
    const [trajetsData, setTrajetsData] = useState([]); // Permet d'affiner les résultats des trajets en fonction du demandeur. On n'utilise pas populate car impossible de classer par jour de semaine dans le back en populate
    const [demandeEnvoyee, setDemandeEnvoyee] = useState(false); // Permet d'afficher un message et une redirection vers les trajets aller du même membre quand la demande est passée

    const [error, setError] = useState();
    const [checkItems, setCheckItems] = useState({}); // CheckBox
    const [passagerOuConducteur, setPassagerOuConducteur] = useState(); // Menu déroulant 
    const [allerOuRetour] = useState("retour"); // Comme il s'agit du matching retour, la demande dans la bdd sera indiqué comme étant pour un trajet retour
    const { id, membreId } = useParams();

    const HandleChange = (e) => {
        setCheckItems({
            ...checkItems,
            [e.target.name]: e.target.checked
        });
    }

    const HandleDropdownChange = (e) => {
        setPassagerOuConducteur(e.target.value);
        setCheckItems({}); // Permet de décocher toutes les checkboxs en changeant le rôle pour la demande de covoiturage
    }

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchReceveurData(){ // On récupères les données du membre qui reçoit la demande
            const result = await Requete.get(
                "/matching/profil/" + id,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchReceveurData();

        async function fetchDemandeurData(){ // On récupère les données de la personne qui fait la demande pour comparer les rôles
            const demandeurResult = await Requete.get(
                "/matching/profil/" + membreId,
                { headers: { "x-auth-token": token } },
            )
            setDemandeurData(demandeurResult.data);
        }
        fetchDemandeurData();

    }, [membreId, id, token]);

    useEffect(()=>{
        // Affiche tous les trajets compatibles avant que le demandeur choisisse s'il sera conducteur ou passager
        async function fetchTrajetsCompatibles(){
            const trajetsResult = await Requete.get(
                "/matching/trajets/retour/" + id + "/" + membreId + "/" + passagerOuConducteur,
                { headers: { "x-auth-token": token } },
            )
            setTrajetsData(trajetsResult.data);
        }
        fetchTrajetsCompatibles();
        
    }, [passagerOuConducteur, token, id, membreId]);

    const submit = async function(e){
        e.preventDefault(e);

        try{
            const demandeCovoiturage = { checkItems, allerOuRetour, passagerOuConducteur };
    
            await Requete.post(
                // membreId ets l'id de la personne qui demande à faire parti du covoiturage
                // id est l'id de la personne qui reçoit la demande de covoiturage
                "/covoiturageDemande/creer/" + membreId + "/" + id,
                demandeCovoiturage,
                { headers: { "x-auth-token": token } }
            );
            setDemandeEnvoyee(true);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        };
    };

    return(
        <div>
            {demandeurData.length === 0 || data.length === 0 || trajetsData.length === 0 ? 
                <h3 sytle={{marginTop: "80px"}}>Chargement des données</h3>
            : trajetsData === "Queud" ?
                <div className=" container card">
                    <h3 style={{textAlign: "center"}}>Aucun trajet retour de {data[0].prenom} ne correspond avec vos critères</h3>
                    <h3 style={{textAlign: "center"}}>Revenir à la recherche de covoiturage de trajets <Link to={"/matching/aller/" + membreId}>aller</Link> ou <Link to={"/matching/retour/" + membreId}>retour</Link></h3>
                </div>
            :
                <div className="card" style={{width:"60rem"}}>
                    <div className="card-body inside-card-body" style={{border: "3px solid #317681", backgroundColor: "#317681", textAlign: "center", color: "whitesmoke", marginBottom: "10px"}}>
                        {data.map(membre => (
                            <div key={membre._id}>
                                <h4>{membre.prenom}</h4>
                                <h5>Rôle: {membre.role}</h5>
                                {membre.role !== "Je suis passager exclusif" &&
                                    <h5>Paiement: {membre.mode_paiement}</h5>
                                }
                            </div>
                        ))}
                    </div>
                    <form onSubmit={submit}>
                        {error && (
                        <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                        )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                        {(demandeurData[0].role === "Je suis conducteur exclusif" || data[0].role === "Je suis passager exclusif") &&
                            <div>
                                <h5 style={{color: "red", textAlign: "center"}}>Etant donné vos rôles respectifs, une demande pour être conducteur sera envoyé à {data[0].prenom}.</h5>
                                {/* {setPassagerOuConducteur("Conducteur")} */}
                                {()=>{setPassagerOuConducteur("Conducteur")}}
                            </div>
                        }
                        {(demandeurData[0].role === "Je suis passager exclusif" || data[0].role === "Je suis conducteur exclusif") &&
                            <div>
                                <h5 style={{color: "red", textAlign: "center"}}>Etant donné vos rôles respectifs, une demande pour être passager sera envoyé à {data[0].prenom}.</h5>
                                {/* {setPassagerOuConducteur("Passager")} */}
                                {()=>{setPassagerOuConducteur("Passager")}}
                            </div>
                        }
                        {/* Pour les personnes qui ont le même rôle pas la peine de traiter si les 2 sont conducteurs (ou passagers) exclusifs car le matching ne leur permet pas de se trouver*/}
                        {((demandeurData[0].role === "Je suis conducteur mais disposé à me mettre en passager" && data[0].role === "Je suis passager et conducteur occasionnel") 
                            || (demandeurData[0].role === "Je suis passager et conducteur occasionnel" && data[0].role === "Je suis conducteur mais disposé à me mettre en passager")
                            || demandeurData[0].role === data[0].role)
                            &&
                            <div>
                                <br></br>
                                <h5>Vous avez tous les deux émis la possibilité d'être conducteur et/ou passager.</h5>
                                <div className="form-inline">
                                <h5><label className="my-1 mr-2">Souhaitez vous faire cette demande en tant que:</label></h5>
                                    <select
                                        className='form-control'
                                        onChange={HandleDropdownChange}
                                    >
                                        <option>Choisir</option>
                                        <option value="Conducteur">Conducteur</option>
                                        <option value="Passager">Passager</option>
                                    </select>
                                </div>
                            </div>
                        }
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{width:"10px"}}>Choisir</th>
                                    <th>Trajet</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trajetsData.map(retour => (
                                    <tr key={retour._id}>
                                        <td>
                                            <label style={{textAlign:"center"}}>
                                                <CheckBox
                                                    name={retour._id}
                                                    checked={checkItems[retour._id]}
                                                    onChange={HandleChange}
                                                />
                                            </label>
                                        </td>
                                        <td>
                                            <p><strong>{retour.jour}:</strong> de {retour.depart}{retour.depart_quartier && <span>, {retour.depart_quartier}</span>} à {retour.heure_de_depart_en_string} pour {retour.destination}{retour.destination_quartier && <span>, {retour.destination_quartier}</span>} {passagerOuConducteur !== "Conducteur" && <span>Places disponibles: {retour.nombre_de_places}</span>}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {demandeEnvoyee && 
                            <div>
                                <h4 style={{color: "green", textAlign: "center"}}>Demande de covoiturage envoyéee !!!</h4>
                                <h5 style={{textAlign: "center"}}><Link to={"/matching/aller/profil/" + id + "/" + membreId}>Voir les trajets allers de {data[0].prenom}</Link></h5>
                            </div>
                        }
                        <div className='form-group'>
                            <input type='submit' value='Faire une demande de covoiturage' className='btn btn-primary float-right'/>
                            <Link to={"/matching/retour/" + membreId}>Page précédente</Link>
                        </div>
                    </form>
                </div>
            }
        </div>
    )
}