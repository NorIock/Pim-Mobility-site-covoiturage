import React from 'react';

import AfficherMonProfil from './AfficherProfil';
import AfficherMesTrajets from './AfficherTrajets';
import AfficherMessageNonPassagerExclusifEtPasDePlace from './MessageErreurRoleNombrePlace';

export default function AfficherToutLeProfil(){

    return(
        <div style={{marginTop: "80px"}}>
            <AfficherMessageNonPassagerExclusifEtPasDePlace />
            <AfficherMonProfil />
            <AfficherMesTrajets />
        </div>
    )
}