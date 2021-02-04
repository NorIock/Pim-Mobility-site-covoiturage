import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../middlewares/Requete';

export default function AfficherContenuNotificationQuitteCovoiturage(){

    const [data, setData] = useState([]);
    const { notificationId, prenom } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/notifications/fin-covoiturage/" + notificationId,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();
    }, [notificationId, token])

    return(
        <div className="container" style={{marginTop: "80px"}}>
            {data.length === 0 ? (
                <h3>Chargement...</h3>
            ) : (
                <div>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>
                                    {data.trajets_aller_quitte.length + data.trajets_retour_quitte.length === 1 ? (<span>Trajet arrêté</span>) : (<span>Trajets arrêtés</span>)} par {prenom}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.trajets_aller_quitte.map(allerQuittes => (
                                <tr key={allerQuittes._id}>
                                    <td>
                                        <h4><span style={{textDecoration: "underline"}}>Aller:</span> effectué le {allerQuittes.jour.toLowerCase()} de {allerQuittes.depart}{allerQuittes.depart_quartier && <span>, {allerQuittes.depart_quartier}</span>} pour {allerQuittes.destination}{allerQuittes.destination_quartier && <span>, {allerQuittes.destination_quartier}</span>} à {allerQuittes.heure_de_depart_en_string}</h4>
                                    </td>
                                </tr>
                            ))}
                            {data.trajets_retour_quitte.map(retourQuittes => (
                                <tr key={retourQuittes._id}>
                                    <td>
                                        <h4><span style={{textDecoration: "underline"}}>Retour:</span> effectué le {retourQuittes.jour.toLowerCase()} de {retourQuittes.depart}{retourQuittes.depart_quartier && <span>, {retourQuittes.depart_quartier}</span>} pour {retourQuittes.destination}{retourQuittes.destination_quartier && <span>, {retourQuittes.destination_quartier}</span>} à {retourQuittes.heure_de_depart_en_string}</h4>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{textAlign: "center", marginTop: "20px"}}>
                        <Link to={"/"}><h3>Retour</h3></Link>
                    </div>
                </div>
            )}
        </div>
    )
}