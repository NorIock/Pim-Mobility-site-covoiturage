import React from 'react';

import StatistiquesAdministrateur from './utilisateurs/Administrateurs';
import StatistiquesMembres from './utilisateurs/Membres';
import StatistiquesTrajetsAller from './trajets/aller/TrajetsAller';
import StatistiquesTrajetsRetour from './trajets/retour/TrajetsRetour';
import StatistiquesDepartsTrajetsAller from './trajets/aller/TrajetAllerDeparts';
import StatistiquesDestinationsTrajetsAller from './trajets/aller/TrajetAllerDestinations';
import StatistiquesDepartsTrajetsRetour from './trajets/retour/TrajetRetourDeparts';
import StatistiquesDestinationsTrajetsRetour from './trajets/retour/TrajetRetourDestinations';
import StatistiquesNavigation from './navigation/Navigation';
import StatistiquesDemandesCovoiturage from './demandesCovoiturages/Demandes';

export default function AffichezToutesLesStatistiques(){

    return(
        <div style={{marginTop: "80px"}} className="container">
            <StatistiquesAdministrateur />
            <StatistiquesMembres />
            <StatistiquesTrajetsAller />
            <StatistiquesDepartsTrajetsAller />
            <StatistiquesDestinationsTrajetsAller />
            <StatistiquesTrajetsRetour />
            <StatistiquesDepartsTrajetsRetour />
            <StatistiquesDestinationsTrajetsRetour />
            <StatistiquesNavigation />
            <StatistiquesDemandesCovoiturage />
        </div>
    )
}