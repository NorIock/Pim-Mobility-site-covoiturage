import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../../middlewares/Requete';
import StatistiqueDemandesAcceptees from './demandesDetail/DemandesAcceptees';
import StatistiqueDemandesRefusees from './demandesDetail/DemandesRefusees';
import StatistiqueDemandesAnnulees from './demandesDetail/DemandesAnnulées';
import StatistiqueDemandesEnCours from './demandesDetail/DemandesEnCours';

export default function StatistiquesDemandesCovoiturage(){

    const [data, setData] = useState([]);
    const [toutes] = useState("toutes");
    const [enCours] = useState("en-cours");
    const [acceptees] = useState("acceptees");
    const [refusees] = useState("refusees");
    const [annulees] = useState("annulees")
    
    const history = useHistory();

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/covoiturageDemande/admin/afficher/toutes",
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();
    }, [token]);

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center"}}>Chargement...</h3>
            ): 
            <div style={{marginTop: "5px"}}>
                <div className="affichage-stat">
                    <h5>Demandes de covoiturage: {data.length}</h5>
                    <table className="table">
                        <tbody>
                            <tr onClick={()=>history.push("/admin/demandeCovoit/" + toutes)}>
                                <td style={{width: "95%"}}>Total:</td>
                                <td>{data.length}</td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/demandeCovoit/" + enCours)}>
                                <td style={{width: "95%"}}>Demandes en cours</td>
                                <td><StatistiqueDemandesEnCours /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/demandeCovoit/" + acceptees)}>
                                <td style={{width: "95%"}}>Demandes acceptées:</td>
                                <td><StatistiqueDemandesAcceptees /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/demandeCovoit/" + refusees)}>
                                <td style={{width: "95%"}}>Demandes refusées:</td>
                                <td><StatistiqueDemandesRefusees /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/demandeCovoit/" + annulees)}>
                                <td style={{width: "95%"}}>Demandes annulées:</td>
                                <td><StatistiqueDemandesAnnulees /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            }
        </div>
    )
}