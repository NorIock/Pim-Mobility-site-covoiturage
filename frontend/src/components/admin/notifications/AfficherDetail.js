import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AdminAfficherDetailNotificationCovoiturage(){

    const [data, setData] = useState([]);
    const { id, allerOuRetour, origine } = useParams();

    let token = localStorage.getItem('auth-token');
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/notifications/admin/afficher-detail/" + id + "/" + allerOuRetour,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();
    }, [id, allerOuRetour, token]);

    return(
        <div style={{marginTop: "55px"}}>
            {data.length === 0 ? (
                <h3 style={{marginTop: "30px", textAlign: "center"}}>Chargement...</h3>
            ) : (
                <div style={{marginTop: "80px"}}>
                    <div style={{marginLeft:"250px", marginRight:"250px"}}>
                        <table className="table affichage-profil">
                            <thead>
                                <tr>
                                    <th style={{textAlign: "center"}}>
                                        <h3>
                                            Demande de covoiturage de {data.demandes_covoit[0].demandeur_prenom} pour {data.demandes_covoit[0].receveur_prenom}
                                        </h3>
                                        <h4>
                                            Faite le: {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(data.date_demande))}
                                        </h4>
                                        {data.notification_vue === false &&
                                            <h4>Non vue par {data.demandes_covoit[0].receveur_prenom}</h4>
                                        }
                                        {(data.notification_vue === true && data.notification_ouverte === false) && 
                                            <div>
                                                <h4>Vue le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(data.date_vue))}</h4>
                                                <h4>Non ouverte</h4>
                                            </div>
                                        }
                                        {data.notification_ouverte === true && 
                                            <h4>Ouverte le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(data.date_ouverte))}</h4>
                                        }
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.demandes_covoit.map(demandes_covoiturage => (
                                    <tr key={demandes_covoiturage._id}>
                                        {(demandes_covoiturage.aller_ou_retour === "aller" && demandes_covoiturage.aller_ou_retour.trajets_aller !== undefined) &&
                                        <td>
                                            <h4>
                                                Trajet effectué le <strong>{demandes_covoiturage.trajets_aller[0].jour}</strong> de <strong>
                                                {demandes_covoiturage.trajets_aller[0].depart}{demandes_covoiturage.trajets_aller[0].depart_quartier && <span>, {demandes_covoiturage.trajets_aller[0].depart_quartier}</span>}</strong> à <strong>{demandes_covoiturage.trajets_aller[0].heure_de_depart_en_string}
                                                </strong> pour <strong>{demandes_covoiturage.trajets_aller[0].destination}{demandes_covoiturage.trajets_aller[0].destination_quartier && <span>, {demandes_covoiturage.trajets_aller[0].destination_quartier}</span>}</strong>
                                            </h4>
                                        </td>
                                        }
                                        {(demandes_covoiturage.aller_ou_retour === "retour" && demandes_covoiturage.aller_ou_retour.trajets_retour !== undefined) &&
                                        <td>
                                            <h4>
                                                Trajet effectué le <strong>{demandes_covoiturage.trajets_retour[0].jour}</strong> de <strong>
                                                {demandes_covoiturage.trajets_retour[0].depart}{demandes_covoiturage.trajets_retour[0].depart_quartier && <span>, {demandes_covoiturage.trajets_retour[0].depart_quartier}</span>}</strong> à <strong>{demandes_covoiturage.trajets_retour[0].heure_de_depart_en_string}
                                                </strong> pour <strong>{demandes_covoiturage.trajets_retour[0].destination}{demandes_covoiturage.trajets_retour[0].destination_quartier && <span>, {demandes_covoiturage.trajets_retour[0].destination_quartier}</span>}</strong>
                                            </h4>
                                        </td>
                                        }
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                        <Link to={"/admin/notifications/" + origine}>Retour</Link>
                                        {/* <Link>Bloquer {data.demandes_covoit[0].receveur_prenom}</Link> */}
                                    </th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            )}

        </div>
    )
}