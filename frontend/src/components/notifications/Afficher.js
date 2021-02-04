import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../middlewares/Requete';

export default function AfficherNotification(){

    const [data, setData]= useState([]);

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    let membreId = localStorage.getItem("id-pour-notifications");

    useEffect(()=>{

        async function fetchData(){
            const result = await Requete.get(
                "/notifications/afficher/" + membreId,
                { headers: { "x-auth-token": token } },
            );
            setData(result);
        }
        if(membreId !== ""){
        fetchData();
        }
    }, [token, membreId]);

    return(
        <div>
            {membreId === "" ? (
                null
            ) : 
            data.length === 0 ? (
                <p>Chargement...</p>
            ) : (   
                <div style={{marginTop: "80px"}}>
                    {data.data.map(notifications => (
                        notifications.demandes_covoit.length > 0 ? 
                            <div key={notifications._id}>
                                <h3 className="notification-demande-covoiturage">
                                    <Link to={"/demandesCovoiturages/recues/" + notifications._id + "/" + notifications.demandes_covoit[0].aller_ou_retour} className="notification-demande-covoiturage-link">
                                    Vous avez une demande de covoiturage planifié de {notifications.demandes_covoit[0].demandeur_prenom} pour {notifications.demandes_covoit.length} {notifications.demandes_covoit.length === 1 ? (<span>trajet</span>) : (<span>trajets</span>)} {notifications.demandes_covoit[0].aller_ou_retour}
                                    </Link>
                                </h3>
                            </div>
                        : 
                        (notifications.notification_pour === "Refus demande covoiturage" && !notifications.date_ouverte) ?
                            <div key={notifications._id}>
                                <h3 className="notification-demande-covoiturage-refus">
                                    <Link to={"/demandesCovoiturages/notification/refus/" + notifications._id + "/" + notifications.demandes_covoit_refusees[0].aller_ou_retour} className="notification-demande-covoiturage-link">
                                    Vous avez eu un refus de demande de covoiturage planifié de {notifications.demandes_covoit_refusees[0].receveur_prenom} pour {notifications.demandes_covoit_refusees.length} {notifications.demandes_covoit_refusees.length === 1 ? (<span>trajet</span>) : (<span>trajets</span>)} {notifications.demandes_covoit_refusees[0].aller_ou_retour}
                                    </Link>
                                </h3>
                            </div>
                        : 
                        (notifications.notification_pour === "Accord demande covoiturage"  && !notifications.date_ouverte) ?
                            <div key={notifications._id}>
                                <h3 className="notification-demande-covoiturage-accord">
                                    <Link to={"/demandesCovoiturages/notification/accord/" + notifications._id + "/" + notifications.demandes_covoit_acceptees[0].aller_ou_retour} className="notification-demande-covoiturage-link">
                                    Vous avez eu un accord de demande de covoiturage planifié de {notifications.demandes_covoit_acceptees[0].receveur_prenom} pour {notifications.demandes_covoit_acceptees.length} {notifications.demandes_covoit_acceptees.length === 1 ? (<span>trajet</span>) : (<span>trajets</span>)} {notifications.demandes_covoit_acceptees[0].aller_ou_retour}
                                    </Link>
                                </h3>
                            </div>
                        : 
                        (notifications.notification_pour === "Message" && !notifications.date_ouverte) ?
                            <div key={notifications._id}>
                                <h3 className="notification-message">
                                    <Link to={"/demandesCovoiturages/notification/message/accord/" + notifications._id} className="notification-demande-covoiturage-link">
                                    Vous avez eu un message de {notifications.message.prenom}
                                    </Link>
                                </h3>
                            </div>
                        :
                        (notifications.notification_pour === "Sorti d'un covoiturage" && !notifications.date_ouverte) ?
                            <div key={notifications._id}>
                                <h3 className="notification-fin-covoiturage">
                                    <Link to={"/notifications/finCovoiturage/" + notifications._id + "/" + notifications.conducteur_qui_fait_sortir_prenom} className="notification-demande-covoiturage-link">
                                    {(notifications.trajets_aller_quitte.length > 0 && notifications.trajets_retour_quitte.length === 0) &&
                                        <div>
                                            {notifications.conducteur_qui_fait_sortir_prenom} vous fait quitter {notifications.trajets_aller_quitte.length} {notifications.trajets_aller_quitte.length === 1 ? (<span>trajet aller</span>) : (<span>trajets aller</span>)}
                                        </div>
                                    }
                                    {(notifications.trajets_retour_quitte.length > 0 && notifications.trajets_aller_quitte.length === 0) &&
                                        <div>
                                            {notifications.conducteur_qui_fait_sortir_prenom} vous fait quitter {notifications.trajets_retour_quitte.length} {notifications.trajets_retour_quitte.length === 1 ? (<span>trajet retour</span>) : (<span>trajets retour</span>)}
                                        </div>
                                    }
                                    {(notifications.trajets_retour_quitte.length > 0 && notifications.trajets_aller_quitte.length > 0) &&
                                        <div>
                                            {notifications.conducteur_qui_fait_sortir_prenom} vous fait quitter {notifications.trajets_aller_quitte.length} {notifications.trajets_aller_quitte.length === 1 ? (<span>trajet aller</span>) : (<span>trajets aller</span>)} et {notifications.trajets_retour_quitte.length} {notifications.trajets_retour_quitte.length === 1 ? (<span>trajet retour</span>) : (<span>trajets retour</span>)}
                                        </div>
                                    }
                                    </Link>
                                </h3>
                            </div>
                        :
                        (notifications.notification_pour === "Quitter un covoiturage" && !notifications.date_ouverte) ?
                            <div key={notifications._id}>
                                <h3 className="notification-fin-covoiturage">
                                    <Link to={"/notifications/finCovoiturage/" + notifications._id + "/" + notifications.passager_qui_quitte_prenom} className="notification-demande-covoiturage-link">
                                    {(notifications.trajets_aller_quitte.length > 0 && notifications.trajets_retour_quitte.length === 0) &&
                                        <div>
                                            {notifications.passager_qui_quitte_prenom} quitte {notifications.trajets_aller_quitte.length} {notifications.trajets_aller_quitte.length === 1 ? (<span>trajet aller</span>) : (<span>trajets allers</span>)}
                                        </div>
                                    }
                                    {(notifications.trajets_retour_quitte.length > 0 && notifications.trajets_aller_quitte.length === 0) &&
                                        <div>
                                            {notifications.passager_qui_quitte_prenom} quitte {notifications.trajets_retour_quitte.length} {notifications.trajets_retour_quitte.length === 1 ? (<span>trajet retour</span>) : (<span>trajets retours</span>)}
                                        </div>
                                    }
                                    {(notifications.trajets_retour_quitte.length > 0 && notifications.trajets_aller_quitte.length > 0) &&
                                        <div>
                                            {notifications.passager_qui_quitte_prenom} quitte {notifications.trajets_aller_quitte.length} {notifications.trajets_aller_quitte.length === 1 ? (<span>trajet aller</span>) : (<span>trajets allers</span>)} et {notifications.trajets_retour_quitte.length} {notifications.trajets_retour_quitte.length === 1 ? (<span>trajet retour</span>) : (<span>trajets retour</span>)}
                                        </div>
                                    }
                                    </Link>
                                </h3>
                            </div>
                        : null
                    ))}
                </div>
            )}
        </div>
    )
}