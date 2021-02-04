import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import BarreNavigationNotificationsPourAdmin from './AfficherNavigation';

export default function AfficherNotificationsNonVues(){

    const [data, setData] = useState([]);
    const [origine] = useState("afficher-non-vues")

    let token = localStorage.getItem('auth-token');
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/notifications/admin/afficher-non-vues",
                { headers: { "x-auth-token": token } },
            );
            setData(result);
        }
        fetchData();
    }, [token])

    return(
        <div style={{marginTop: "55px"}}>
            {data.length === 0 ? (
                <p>Chargement...</p>
            ) : (
                <div>
                    <BarreNavigationNotificationsPourAdmin />
                    <div style={{textAlign: "center"}}>
                        <h3>Notifications non vues par les membres:</h3>
                        <h3>Nombre total: {data.data.length}</h3>
                    </div>
                    <div className="card" style={{width: "60rem", marginTop:"20px"}}>
                        {data.data.map(notifications =>(
                            <ul className="list-group list-group-flush" key={notifications._id}>
                                <li className="list-group-item">
                                    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                        <h4>
                                            Envoyée à <Link to={"/membre/" + notifications.membre_notif_id}>
                                            {notifications.membre_notif_prenom} {notifications.membre_notif_nom}</Link> par <Link to={"/membre/" + notifications.demandes_covoit[0].demandeur_id}>
                                            {notifications.demandes_covoit[0].demandeur_prenom} {notifications.demandes_covoit[0].demandeur_nom}</Link> le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(notifications.date_demande))}
                                        </h4>
                                        <h5><Link to={"/admin/notification/covoiturage/detail/" + notifications._id + "/" + notifications.demandes_covoit[0].aller_ou_retour + "/" + origine}>Voir plus</Link></h5>
                                    </div>
                                </li>
                            </ul>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}