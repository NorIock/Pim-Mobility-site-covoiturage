import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import BarreNavigationDemandesCovoitEnvoyees from './Navigation';

export default function AfficherDemandesCovoiturageEnvoyeesEncours(){

    const [data, setData] = useState([]);
    const [noData, setNoData] = useState(false) // Pour afficher une page spécifique s'il n'y a pas de demande en cours
    const { id } = useParams(); // id du membre

    let token = localStorage.getItem("auth-token")
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/covoiturageDemande/afficher/envoyees/" + id,
                { headers: {"x-auth-token": token } },
            )
            if(result.data.length === 0){
                setNoData(true);
            }
            setData(result);
        }
        fetchData();
    }, [id, token]);

    return(
        <div style={{marginTop: "55px"}}>
            {data.length === 0 ? (
                <p>Chargement...</p>
            ) : (
                <div>
                    <BarreNavigationDemandesCovoitEnvoyees />
                    {noData === true &&
                        <div className="container" style={{marginTop:"80px"}}>
                            <h3 style={{textAlign: "center"}}>Pas de demandes de covoiturages en cours pour le moment.</h3>
                            <h3 style={{textAlign: "center"}}>Rechercher des covoitureurs pour l'<Link to={"/matching/aller/" + id}>aller</Link> ou le <Link to={"/matching/retour/" + id}>retour</Link></h3>
                        </div>
                    }
                    {noData === false &&
                    <div className= "container" style={{marginTop: "40px"}}>
                        <table className="table affichage-profil">
                            <thead>
                                <tr>
                                    <th style={{textAlign: "center"}}>
                                        {data.data.length === 1 &&
                                            <h5>Vous avez {data.data.length} demande de covoiturage envoyée en cours:</h5>
                                        }
                                        {data.data.length > 1 &&
                                            <h5>Vous avez {data.data.length} demandes de covoiturages envoyées en cours:</h5>
                                        }
                                        <h6><Link  style={{color: "red", textDecoration: "none"}} to={"/demandesCovoiturages/supprimer/" + id}>Supprimer une ou plusieurs demande(s) de covoiturage</Link></h6>
                                    </th>
                                </tr>
                            </thead>
                            {data.data.map(demandes_covoiturage => (
                                <tbody key={demandes_covoiturage._id}>
                                    {demandes_covoiturage.trajets_aller.length !== 0 &&
                                        <tr>
                                            {demandes_covoiturage.trajets_aller.map(demandeAller => (
                                            <td key={demandeAller._id}>
                                                <h5>Demande en tant que <strong>{demandes_covoiturage.passager_ou_conducteur}</strong> à <Link to={"/profil/partiel/" + demandes_covoiturage.receveur_id + "/" + id}><strong>{demandeAller.prenom}</strong></Link> pour un <strong>trajet {demandes_covoiturage.aller_ou_retour}</strong></h5>
                                                <h5>Le <strong>{demandeAller.jour.toLowerCase()}</strong> de {demandeAller.depart}{demandeAller.depart_quartier && <span>, {demandeAller.depart_quartier}</span>} à {demandeAller.heure_de_depart_en_string} pour {demandeAller.destination}{demandeAller.destination_quartier && <span>, {demandeAller.destination_quartier}</span>}</h5>
                                            </td>
                                            ))}
                                        </tr>
                                    }
                                    {demandes_covoiturage.trajets_retour.length !== 0 &&
                                        <tr>
                                            {demandes_covoiturage.trajets_retour.map(demandeRetour => (
                                            <td key={demandeRetour._id}>
                                                <h5>Demande en tant que <strong>{demandes_covoiturage.passager_ou_conducteur}</strong> à <Link to={"/profil/partiel/" + demandes_covoiturage.receveur_id + "/" + id}><strong>{demandeRetour.prenom}</strong></Link> pour un <strong>trajet {demandes_covoiturage.aller_ou_retour}</strong></h5>
                                                <h5>Le <strong>{demandeRetour.jour.toLowerCase()}</strong> de {demandeRetour.depart}{demandeRetour.depart_quartier && <span>, {demandeRetour.depart_quartier}</span>} à {demandeRetour.heure_de_depart_en_string} pour {demandeRetour.destination}{demandeRetour.destination_quartier && <span>, {demandeRetour.destination_quartier}</span>}</h5>
                                            </td>
                                            ))}
                                        </tr>
                                    }
                                </tbody>
                            ))}

                        </table>
                    </div>
                    }
                </div>
            )}
        </div>
    )
}