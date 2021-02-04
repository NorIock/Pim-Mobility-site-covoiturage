import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';
import CheckBox from '../../../middlewares/CheckBox';

export default function AfficherDemandesCovoiturageRecues(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();
    const { id, aller_ou_retour } = useParams();
    const [checkItems, setCheckItems] = useState({}); // Checkbox
    const history = useHistory();

    const HandleChange = (e) => {
        setCheckItems({
            ...checkItems,
            [e.target.name]: e.target.checked
        });
    }

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/notifications/afficher-une/" + id + "/" + aller_ou_retour,
                { headers: { "x-auth-token": token } },
            );
            setData(result);
        }
        fetchData();
    }, [id, token, aller_ou_retour]);

    const submitAccepter = async function(e){
        e.preventDefault();

        try{
            const demandesCovoiturageAcceptees = { checkItems, id };

            await Requete.post(
                "/covoiturageDemande/accepter",
                demandesCovoiturageAcceptees,
                { headers: { "x-auth-token": token } }
            );
            // id est celui de la notification, cela nous permettra de recupérer les ids des 2 membres pour la création de la conversation
            // aller_ou_retour permettra de revenir sur cette page après le message (envoyé ou pas) au cas où le membre n'a pas validé toutes
            // les demandes de covoiturage de la notification
            history.push("/message-suite-accord-demande-covoiturage/" + id + "/" + aller_ou_retour + "/" + data.data.demandes_covoit[0].demandeur_prenom);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    const submitRefuser = async function(e){
        e.preventDefault();

        try{
            // Permet de transmettre via la barre d'adresse au component du motif du refus le nombre de checkItems cochés
            // Cela permettra, lors de l'ajout du motif de selectionner les bonnes demandes de covoiturages refusées pour le 
            // motif au cas où l'utilisateur refuserait en plusieurs fois

            let CheckItemCoche = [];
            for(const [key, value] of Object.entries(checkItems)){
                if(value === true){
                    CheckItemCoche = CheckItemCoche.concat(key);
                }
            }
            let nombreCheckItemCoche = CheckItemCoche.length;

            // l'id est celui de la notification qui nous permettra dans le back de la récupérer et retirer les demandes refusées
            const demandesCovoituragesRefusees = { checkItems, id, nombreCheckItemCoche };

            await Requete.post(
                "/covoiturageDemande/refuser",
                demandesCovoituragesRefusees,
                { headers: { "x-auth-token": token } }
            );
            history.push("/motif-suite-refus-demande-de-covoiturage/indiquer/" + id + "/" + aller_ou_retour + "/" + nombreCheckItemCoche);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div>
            {data.length === 0 ? (
                <p>Chargement....</p>
            ) : (
                data.data.demandes_covoit.length === 0 ?(
                    history.push("/")
                ) : (
                <div>
                    <h3 style={{marginTop: "80px", textAlign: "center"}}>
                        Demande de covoiturage de {data.data.demandes_covoit[0].demandeur_prenom}
                        <br></br>
                        Rôle: {data.data.demandes_covoit[0].passager_ou_conducteur}
                    </h3>
                    <br></br>
                        <div style={{marginLeft:"250px", marginRight:"250px"}}>
                            <table className="table demandes-covoiturages-recues">
                                <thead>
                                    <tr>
                                        <th style={{width:"10px"}}>Choisir</th>
                                        <th>Trajet demandé:</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {data.data.demandes_covoit.map(demandes_covoiturage => (
                                <tr key={demandes_covoiturage._id}>
                                    <td>
                                        <label style={{textAlign:"center"}}>
                                            <CheckBox
                                                name={demandes_covoiturage._id}
                                                checked={checkItems[demandes_covoiturage._id]}
                                                onChange={HandleChange}
                                            />
                                        </label>
                                    </td>
                                    {(demandes_covoiturage.aller_ou_retour === "Aller" || demandes_covoiturage.aller_ou_retour === "aller") &&
                                    <td>
                                        <h5 key={demandes_covoiturage.id}>
                                            Trajet effectué le <strong>{demandes_covoiturage.trajets_aller[0].jour}</strong> de <strong>
                                            {demandes_covoiturage.trajets_aller[0].depart}{demandes_covoiturage.trajets_aller[0].depart_quartier && <span>, {demandes_covoiturage.trajets_aller[0].depart_quartier}</span>}</strong> à <strong>{demandes_covoiturage.trajets_aller[0].heure_de_depart_en_string}
                                            </strong> pour <strong>{demandes_covoiturage.trajets_aller[0].destination}{demandes_covoiturage.trajets_aller[0].destination_quartier && <span>, {demandes_covoiturage.trajets_aller[0].destination_quartier}</span>}</strong>
                                        </h5>
                                        {data.data.demandes_covoit[0].passager_ou_conducteur !== "Conducteur" && 
                                            <h5>Il vous reste <strong>{demandes_covoiturage.trajets_aller[0].nombre_de_places}</strong> place(s) pour ce trajet</h5>
                                        }
                                    </td>
                                    }
                                    {(demandes_covoiturage.aller_ou_retour === "Retour" || demandes_covoiturage.aller_ou_retour === "retour") &&
                                    <td>
                                        <h5 key={demandes_covoiturage.id}>
                                        Trajet effectué le <strong>{demandes_covoiturage.trajets_retour[0].jour}</strong> de <strong>
                                        {demandes_covoiturage.trajets_retour[0].depart}{demandes_covoiturage.trajets_retour[0].depart_quartier && <span>, {demandes_covoiturage.trajets_retour[0].depart_quartier}</span>}</strong> à <strong>{demandes_covoiturage.trajets_retour[0].heure_de_depart_en_string}
                                        </strong> pour <strong>{demandes_covoiturage.trajets_retour[0].destination}{demandes_covoiturage.trajets_retour[0].destination_quartier && <span>, {demandes_covoiturage.trajets_retour[0].destination_quartier}</span>}</strong>
                                        </h5>
                                        {data.data.demandes_covoit[0].passager_ou_conducteur !== "Conducteur" && 
                                            <h5>Il vous reste <strong>{demandes_covoiturage.trajets_retour[0].nombre_de_places}</strong> place(s) pour ce trajet</h5>
                                        }
                                    </td>
                                    }
                                </tr>
                                ))}
                                </tbody>
                            </table>
                            <div style={{paddingLeft:"1%", paddingRight:"1%", paddingBottom:"1%", borderLeft: "3px solid #317681", borderRight: "3px solid #317681"}}>
                                {error && (
                                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                                )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                            </div>
                            <div className="demandes-covoiturages-recues-boutons">
                                <input
                                    type='submit'
                                    value='Accepter'
                                    className='btn btn-primary'
                                    onClick={submitAccepter}
                                />
                                <input
                                    type='submit'
                                    value='Refuser'
                                    className='btn btn-danger space-between-submit'
                                    onClick={submitRefuser}
                                />
                                <p></p>
                            </div>
                            <h4 style={{textAlign: "center"}}><Link to={"/"}>Retour</Link></h4>
                        </div>
                    
                </div>
            ))}
        </div>
    )
}