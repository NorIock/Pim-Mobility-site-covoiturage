import React from 'react';

import StatistiqueNavigationDetail from './navigationDetail/Detail';

export default function StatistiquesNavigation(){

    return(
        <div style={{marginTop: "5px"}}>
            <div className="affichage-stat-sans-pointeur">
                <h5>Navigation:</h5>
                <table className="table">
                    <tbody>
                        <tr>
                            <td style={{width: "95%"}}>Recherches de trajets aller (via la barre de navigation):</td>
                            <td><StatistiqueNavigationDetail page="matching aller" /></td>
                        </tr>
                        <tr>
                            <td style={{width: "95%"}}>Recherches de trajets retour (via la barre de navigation):</td>
                            <td><StatistiqueNavigationDetail page="matching retour" /></td>
                        </tr>
                        <tr>
                            <td style={{width: "95%"}}>Page Mov'Ici:</td>
                            <td><StatistiqueNavigationDetail page="MovIci" /></td>
                        </tr>
                        <tr>
                            <td style={{width: "95%"}}>Page train:</td>
                            <td><StatistiqueNavigationDetail page="train" /></td>
                        </tr>
                        <tr>
                            <td style={{width: "95%"}}>Page bus:</td>
                            <td><StatistiqueNavigationDetail page="bus" /></td>
                        </tr>
                        <tr>
                            <td style={{width: "95%"}}>Page velo:</td>
                            <td><StatistiqueNavigationDetail page="velo" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}