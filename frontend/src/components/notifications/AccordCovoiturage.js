import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from '../../middlewares/Requete';

export default function AfficherDemandesAccepteesSuiteNotification(){

    const [data, setData] = useState([]);
    const { id, aller_ou_retour } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/notifications/accord/afficher-une/" + id + "/" + aller_ou_retour,
                { headers: { "x-auth-token": token } },
            )
            setData(result);
        }
        fetchData(aller_ou_retour, id, token);
    }, [id, aller_ou_retour, token])

    return(
        <div>
            {data.length === 0 ? (
                <p>chargement....</p>
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>
                                    {data.data.demandes_covoit_acceptees.length === 1 &&
                                    <h5>{data.data.demandes_covoit_acceptees.length} demande acceptée par {data.data.demandes_covoit_acceptees[0].receveur_prenom}:</h5>
                                    }
                                    {data.data.demandes_covoit_acceptees.length > 1 &&
                                    <h5>{data.data.demandes_covoit_acceptees.length} demandes acceptées par {data.data.demandes_covoit_acceptees[0].receveur_prenom}:</h5>
                                    }
                                </th>
                            </tr>
                        </thead>
                        {data.data.demandes_covoit_acceptees.map(demandes_acceptees => (
                        <tbody key={demandes_acceptees._id}>
                            <tr>
                                {demandes_acceptees.aller_ou_retour === "aller" &&
                                <td>
                                    <h5>Trajet {demandes_acceptees.aller_ou_retour} le {demandes_acceptees.trajets_aller[0].jour} de {demandes_acceptees.trajets_aller[0].depart}{demandes_acceptees.trajets_aller[0].depart_quartier && <span>, {demandes_acceptees.trajets_aller[0].depart_quartier}</span>} à {demandes_acceptees.trajets_aller[0].heure_de_depart_en_string} pour {demandes_acceptees.trajets_aller[0].destination}{demandes_acceptees.trajets_aller[0].destination_quartier && <span>, {demandes_acceptees.trajets_aller[0].destination_quartier}</span>}</h5>
                                    <h5>Acceptée le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(demandes_acceptees.date_accord_ou_refus))}</h5>
                                </td>
                                }
                                {demandes_acceptees.aller_ou_retour === "retour" &&
                                <td>
                                    <h5>Trajet {demandes_acceptees.aller_ou_retour} le {demandes_acceptees.trajets_retour[0].jour} de {demandes_acceptees.trajets_retour[0].depart}{demandes_acceptees.trajets_retour[0].depart_quartier && <span>, {demandes_acceptees.trajets_retour[0].depart_quartier}</span>} à {demandes_acceptees.trajets_retour[0].heure_de_depart_en_string} pour {demandes_acceptees.trajets_retour[0].destination}{demandes_acceptees.trajets_retour[0].destination_quartier && <span>, {demandes_acceptees.trajets_retour[0].destination_quartier}</span>}</h5>
                                    <h5>Acceptée le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(demandes_acceptees.date_accord_ou_refus))}</h5>
                                </td>
                                }
                            </tr>
                        </tbody>
                        ))}
                    </table>
                <h4 style={{textAlign: "center"}}><Link to={"/"}>Retour</Link></h4>
                </div>
            )}
        </div>
    )
}