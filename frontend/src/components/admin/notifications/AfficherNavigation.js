import React from 'react';
import { useHistory } from 'react-router-dom';

export default function BarreNavigationNotificationsPourAdmin(){

    const history = useHistory();

    const toutes = function(){history.push("/admin/notifications/afficher-toutes")};
    const nonVues = function(){history.push("/admin/notifications/afficher-non-vues")};
    const vues = function(){history.push("/admin/notifications/afficher-vues")};
    const ouvertes = function(){history.push("/admin/notifications/afficher-ouvertes")};

    return(
        <nav className="admin-notification-nav">
            <button className="admin-notification-button" onClick={toutes}>Toutes</button>
            <button className="admin-notification-button" onClick={nonVues}>Non vues</button>
            <button className="admin-notification-button" onClick={vues}>Vues</button>
            <button className="admin-notification-button" onClick={ouvertes}>Ouvertes</button>
        </nav>
    )
}