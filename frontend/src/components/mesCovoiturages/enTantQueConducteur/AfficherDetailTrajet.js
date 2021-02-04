import React, { useState, useEffect } from 'react';
import {useParams, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherDetailTrajet(){

    const [equipageData, setEquipageData] = useState([]);
    const { trajetId, id } = useParams();

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchEquipageData(){
            const equipageResult = await Requete.get(
                "/mesCovoiturages/afficher/parTrajet/" + trajetId,
                { headers: { "x-auth-token": token } },
            )
            setEquipageData(equipageResult.data);
        }
        fetchEquipageData();
    }, [token, trajetId])

    return(
        <div style={{marginTop: "80px"}}>
            {equipageData.length === 0 ? (
                <h3 style={{marginTop: "40px", textAlign: "center"}}>Chargement...</h3>
            ) : (
                <div className="container">
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <td style={{textAlign: "center"}}><h5>Trajet {equipageData.aller_ou_retour} du {equipageData.jour_trajet.toLowerCase()}</h5></td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{textAlign: "center"}}>
                                {equipageData.trajet_aller &&
                                    <td>
                                        <h5>Part à {equipageData.trajet_aller.heure_de_depart_en_string} de {equipageData.trajet_aller.depart} pour {equipageData.trajet_aller.destination}</h5>
                                        <h5>{equipageData.passagers.length < 2 ? <span>Passager</span> : <span>Passagers</span>}: {equipageData.passagers.map(passager =>(
                                            <span key={passager._id}>{passager.prenom} </span>))}
                                        </h5>
                                    </td>
                                }
                                {equipageData.trajet_retour &&
                                    <td>
                                        <h5>Part à {equipageData.trajet_retour.heure_de_depart_en_string} de {equipageData.trajet_retour.depart} pour {equipageData.trajet_retour.destination}</h5>
                                        <h5>{equipageData.passagers.length < 2 ? <span>Passager</span> : <span>Passagers</span>}: {equipageData.passagers.map(passager =>(
                                            <span key={passager._id}>{passager.prenom} </span>))}
                                        </h5>
                                    </td>
                                }
                            </tr>
                            <tr>
                                <td>
                                    <h6 style={{textAlign: "center"}}><Link to={"/mesCovoiturages/" + id}>Gérer mes covoiturages</Link></h6>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <h5 style={{textAlign: "center"}}><Link to={"/membre/" + id}>Retour</Link></h5>
                </div>
            )}

        </div>
    )
}