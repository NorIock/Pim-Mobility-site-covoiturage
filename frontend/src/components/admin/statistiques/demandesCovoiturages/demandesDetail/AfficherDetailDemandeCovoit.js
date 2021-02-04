import React, { useState, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../../../middlewares/Requete';

export default function AfficherDetailDemandeCovoiturage(){

    const [data, setData] = useState([]);

    const history = useHistory();
    const { type } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/covoiturageDemande/admin/afficher/" + type,
                { headers: { "x-auth-token": token } }
            )
            setData(result.data);
        }
        fetchData();
    }, [token, type]);

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement...</h3>
            ) : (
            data === "Queud" ? 
                <div className="container" style={{ border: "3px solid #317681", textAlign: "center", marginTop: "80px"}}>
                <h3>Aucune demande de covoiturage {type}</h3>
                <br></br>
                <h4 style={{textAlign: "center"}}><Link to={"/admin/statistiques"}>retour</Link></h4>
            </div>
            :
            <div className="container" style={{marginTop: "80px"}}>
                <table className="table affichage-profil">
                    <thead>
                        <tr>
                            <th style={{textAlign: "center"}}>
                                {type === "toutes" && 
                                <h5>Toutes les demandes de covoiturage: {data.length}</h5>
                                }
                                {type === "en-cours" && 
                                <h5>Demandes de covoiturage en cours: {data.length}</h5>
                                }
                                {type === "acceptees" && 
                                <h5>Demandes de covoiturage acceptées: {data.length}</h5>
                                }
                                {type === "refusees" && 
                                <h5>Demandes de covoiturage refusées: {data.length}</h5>
                                }
                                {type === "annulees" && 
                                <h5>Demandes de covoiturage annulées: {data.length}</h5>
                                }
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(demandeCovoiturage =>(
                            <tr className="hover-ponctuel" key={demandeCovoiturage._id} onClick={()=>history.push("/admin/demandeCovoit/detail/" + demandeCovoiturage._id)}>
                                <td>
                                    <h5>Demande {demandeCovoiturage.passager_ou_conducteur} pour un trajet {demandeCovoiturage.aller_ou_retour} faite par {demandeCovoiturage.demandeur_prenom} à {demandeCovoiturage.receveur_prenom} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(demandeCovoiturage.date_demande))}</h5>
                                    {(demandeCovoiturage.aller_ou_retour === "aller" && demandeCovoiturage.aller_ou_retour.trajets_aller !== undefined) &&
                                        <h5>Le {demandeCovoiturage.trajets_aller[0].jour.toLowerCase()} à {demandeCovoiturage.trajets_aller[0].heure_de_depart_en_string} de {demandeCovoiturage.trajets_aller[0].depart} pour {demandeCovoiturage.trajets_aller[0].destination} </h5>
                                    }
                                    {(demandeCovoiturage.aller_ou_retour === "retour" && demandeCovoiturage.aller_ou_retour.trajets_retour !== undefined) &&
                                        <h5>Le {demandeCovoiturage.trajets_retour[0].jour.toLowerCase()} à {demandeCovoiturage.trajets_retour[0].heure_de_depart_en_string} de {demandeCovoiturage.trajets_retour[0].depart} pour {demandeCovoiturage.trajets_retour[0].destination} </h5>
                                    }
                                    {(demandeCovoiturage.validee === true && demandeCovoiturage.acceptee === true && (demandeCovoiturage.aller_ou_retour.trajets_aller !== undefined || demandeCovoiturage.aller_ou_retour.trajets_retour !== undefined)) &&
                                        <h5 style={{color: "blue"}}><strong>Demande acceptée</strong> le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(demandeCovoiturage.date_accord_ou_refus))}</h5>
                                    }
                                    {(demandeCovoiturage.validee === true && demandeCovoiturage.acceptee === false && (demandeCovoiturage.aller_ou_retour.trajets_aller !== undefined || demandeCovoiturage.aller_ou_retour.trajets_retour !== undefined)) &&
                                        <h5 style={{color: "red"}}><strong>Demande refusée</strong> le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(demandeCovoiturage.date_accord_ou_refus))}</h5>
                                    }
                                    {demandeCovoiturage.annulee === true && (demandeCovoiturage.aller_ou_retour.trajets_aller !== undefined || demandeCovoiturage.aller_ou_retour.trajets_retour !== undefined) && 
                                        <h5 style={{color: "orange"}}><strong>Demande annulée</strong> le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(demandeCovoiturage.date_annulation))}</h5>
                                    }
                                    {(demandeCovoiturage.validee === false && demandeCovoiturage.annulee === false  && (demandeCovoiturage.aller_ou_retour.trajets_aller !== undefined || demandeCovoiturage.aller_ou_retour.trajets_retour !== undefined)) &&
                                        <h5><strong>Demande en cours</strong></h5>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <h4 style={{textAlign: "center"}}><Link to={"/admin/statistiques"}>retour</Link></h4>
                <br></br>
            </div>
            )}
        </div>
    )
}