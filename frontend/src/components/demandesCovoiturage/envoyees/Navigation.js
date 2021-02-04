import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

export default function BarreNavigationDemandesCovoitEnvoyees(){

    const history = useHistory();
    const { id } = useParams();

    const enCours = function(){history.push("/demandesCovoiturages/envoyees/en-cours/" + id)};
    const acceptees = function(){history.push("/demandesCovoiturages/envoyees/acceptees/" + id)};
    const refusees = function(){history.push("/demandesCovoiturages/envoyees/refusees/" + id)};

    return(
        <nav className="admin-notification-nav">
            <button className="admin-notification-button" onClick={enCours}>En cours</button>
            <button className="admin-notification-button" onClick={acceptees}>Acceptées</button>
            <button className="admin-notification-button" onClick={refusees}>Refusées</button>
        </nav>
    )
}