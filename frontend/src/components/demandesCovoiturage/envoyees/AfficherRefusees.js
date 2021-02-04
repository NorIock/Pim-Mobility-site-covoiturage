import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import BarreNavigationDemandesCovoitEnvoyees from './Navigation';

export default function AfficherDemandesCovoiturageEnvoyeesRefusees(){

    const [data, setData] = useState([]);
    const [noData, setNoData] = useState(false) // Pour afficher une page spécifique s'il n'y a pas de demande refusées
    const { id } = useParams();

    let token = localStorage.getItem("auth-token")
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/covoiturageDemande/afficher/refusees/envoyees/" + id,
                { headers: {"x-auth-token": token } },
            )
            if(result.data.length === 0){
                setNoData(true);
            }
            setData(result);
        }
        fetchData();
    }, [token, id]);

    return(
        <div style={{marginTop: "55px"}}>
            {data.length === 0 ? (
                <p>Chargement...</p>
            ) : (
                <div>
                    <BarreNavigationDemandesCovoitEnvoyees />
                    {noData === true &&
                    <div className="container" style={{marginTop:"80px"}}>
                        <h3 style={{textAlign: "center"}}>Aucune demande(s) de covoiturage(s) envoyée(s) n'a(ont) été refusée(s)</h3>
                    </div>
                    }
                    <div className="container" style={{marginTop: "40px"}}>
                        <table className="table affichage-profil">
                            <thead>
                                <tr>
                                    {data.data.length === 1 &&
                                        <th style={{textAlign: "center"}}>Vous avez {data.data.length} demande refusée</th>
                                    }
                                    {data.data.length > 1 &&
                                        <th style={{textAlign: "center"}}>Vous avez {data.data.length} demandes refusées</th>
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map(demandes_refusees => (
                                    <tr key={demandes_refusees._id}>
                                        {(demandes_refusees.aller_ou_retour === "aller" && demandes_refusees.aller_ou_retour.trajets_aller !== undefined) && 
                                            <td>
                                                <h5 style={{textDecoration: "underline"}}>Refusée par {demandes_refusees.receveur_prenom} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(demandes_refusees.date_accord_ou_refus))}</h5>
                                                <h5>Trajet {demandes_refusees.aller_ou_retour} le {demandes_refusees.trajets_aller[0].jour} de {demandes_refusees.trajets_aller[0].depart}{demandes_refusees.trajets_aller[0].depart_quartier && <span>, {demandes_refusees.trajets_aller[0].depart_quartier}</span>} à {demandes_refusees.trajets_aller[0].heure_de_depart_en_string} pour {demandes_refusees.trajets_aller[0].destination}{demandes_refusees.trajets_aller[0].destination_quartier && <span>, {demandes_refusees.trajets_aller[0].destination_quartier}</span>}</h5>
                                                <h5>Motif: {demandes_refusees.motif_refus}</h5>
                                            </td>
                                        }
                                        {(demandes_refusees.aller_ou_retour === "retour" && demandes_refusees.aller_ou_retour.trajets_retour !== undefined) &&
                                            <td>
                                                <h5 style={{textDecoration: "underline"}}>Refusée par {demandes_refusees.receveur_prenom} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(demandes_refusees.date_accord_ou_refus))}</h5>
                                                <h5>Trajet {demandes_refusees.aller_ou_retour} le {demandes_refusees.trajets_retour[0].jour} de {demandes_refusees.trajets_retour[0].depart}{demandes_refusees.trajets_retour[0].depart_quartier && <span>, {demandes_refusees.trajets_retour[0].depart_quartier}</span>} à {demandes_refusees.trajets_retour[0].heure_de_depart_en_string} pour {demandes_refusees.trajets_retour[0].destination}{demandes_refusees.trajets_retour[0].destination_quartier && <span>, {demandes_refusees.trajets_retour[0].destination_quartier}</span>}</h5>
                                                <h5>Motif: {demandes_refusees.motif_refus}</h5>
                                            </td>
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}