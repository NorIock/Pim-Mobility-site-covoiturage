import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../../../middlewares/Requete';

export default function StatistiquesDepartsTrajetsRetour(){

    const [data, setData] = useState([]);

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
                "/trajetsRetour/depart/nombre",
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
                    <h5>Zones de départs par trajets retour:</h5>
                    <table className="table">
                        <tbody>
                            {data.map(liste=>(
                                <tr key={liste.depart} onClick={()=>history.push("/admin/retour/depart/" + liste.depart)}>
                                    <td style={{width: "95%"}}>{liste.depart}:</td>
                                    <td>{liste.nombre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            }
        </div>
    )
}