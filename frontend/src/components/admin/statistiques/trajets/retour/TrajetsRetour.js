import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../../../middlewares/Requete';
import StatistiqueTrajetsRetourConducteur from './trajetsRetourDetail/TrajetsRetourConducteur';
import StatistiqueTrajetsRetourPassager from './trajetsRetourDetail/TrajetsRetourPassagers';
import StatistiqueTrajetsRetourSansCovoiturage from './trajetsRetourDetail/TrajetsRetourSansCovoiturage';


export default function StatistiquesTrajetsRetour(){

    const [data, setData] = useState([]);
    const [tous] = useState("afficher-tous");
    const [sansCovoiturage] = useState("sans-covoiturage");
    const [conducteur] = useState("conducteurs");
    const [passager] = useState("passagers");
    
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
                "/trajetsRetour/afficher-tous",
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
                    <h5>Trajets retour: {data.length}</h5>
                    <table className="table">
                        <tbody>
                            <tr onClick={()=>history.push("/admin/trajetsRetour/" + tous)}>
                                <td style={{width: "95%"}}>Total:</td>
                                <td>{data.length}</td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/trajetsRetour/" + conducteur)}>
                                <td style={{width: "95%"}}>Trajets retour pour lesquels un conducteur a trouvé un équipage:</td>
                                <td><StatistiqueTrajetsRetourConducteur /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/trajetsRetour/" + passager)}>
                                <td style={{width: "95%"}}>Trajets retour pour lesquels le membre a trouvé un conducteur:</td>
                                <td><StatistiqueTrajetsRetourPassager /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/trajetsRetour/" + sansCovoiturage)}>
                                <td style={{width: "95%"}}>Trajets retour pour lesquels il n'y a pas de covoiturage:</td>
                                <td><StatistiqueTrajetsRetourSansCovoiturage /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            }
        </div>
    )
}