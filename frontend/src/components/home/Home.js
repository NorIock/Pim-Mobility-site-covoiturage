import React from 'react';
import Notifications from '../notifications/Afficher';
import AfficherActualitePageAccueil from '../actualite/AfficherSurPageAccueil';

export default function Home(){

    return(
        <div style={{marginTop: "80px", textAlign:"center"}}>
            <Notifications />
            <AfficherActualitePageAccueil />
            <div style={{marginTop: "50px"}}>
                <h3>Bonjour,
                    vous êtes sur la page d'accueil,
                    le contenu est en cours d'écriture...
                </h3>
            </div>
        </div>
    )
}