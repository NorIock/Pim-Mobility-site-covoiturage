import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../../../middlewares/Requete';

export default function StatistiquesDestinationsTrajetsRetour(){

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
                "/trajetsRetour/destination/nombre",
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
                    <h5>Zones de destination par trajets retour:</h5>
                    <table className="table">
                        <tbody>
                            {data.map(liste=>(
                                <tr key={liste.destination} onClick={()=>history.push("/admin/retour/destination/" + liste.destination)}>
                                    <td style={{width: "95%"}}>{liste.destination}:</td>
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