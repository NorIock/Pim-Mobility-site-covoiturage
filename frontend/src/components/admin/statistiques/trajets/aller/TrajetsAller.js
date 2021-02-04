import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../../../middlewares/Requete';
import StatistiqueTrajetsAllerConducteur from './trajetsAllerDetail/TrajetsAllerConducteur';
import StatistiqueTrajetsAllerPassager from './trajetsAllerDetail/TrajetsAllerPassagers';
import StatistiqueTrajetsAllerSansCovoiturage from './trajetsAllerDetail/TrajetsAllerSansCovoiturage';


export default function StatistiquesTrajetsAller(){

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
                "/trajetsAller/afficher-tous",
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
                    <h5>Trajets aller: {data.length}</h5>
                    {/* <h5>Nombre: {data.length}</h5>  */}
                    <table className="table">
                        <tbody>
                            <tr onClick={()=>history.push("/admin/trajetsAller/" + tous)}>
                                <td style={{width: "95%"}}>Total:</td>
                                <td>{data.length}</td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/trajetsAller/" + conducteur)}>
                                <td style={{width: "95%"}}>Trajets aller pour lesquels un conducteur a trouvé un équipage:</td>
                                <td><StatistiqueTrajetsAllerConducteur /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/trajetsAller/" + passager)}>
                                <td style={{width: "95%"}}>Trajets aller pour lesquels le membre a trouvé un conducteur:</td>
                                <td><StatistiqueTrajetsAllerPassager /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/trajetsAller/" + sansCovoiturage)}>
                                <td style={{width: "95%"}}>Trajets retour pour lesquels il n'y a pas de covoiturage:</td>
                                <td><StatistiqueTrajetsAllerSansCovoiturage /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            }
        </div>
    )
}