import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../../middlewares/Requete';

export default function StatistiquesAdministrateur(){

    const [data, setData] = useState([]);
    const history = useHistory();
    let from = "statistique";

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/membres/afficher-admin",
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
            <div style={{marginTop: "80px"}}>
                <div className="affichage-stat">
                    <h5>Administrateurs: {data.length}</h5>
                    <table className="table">
                        <tbody>
                            <tr onClick={()=>history.push("/admin/admins/afficher-tous/" + from)}>
                                <td style={{width: "95%"}}>Total:</td>
                                <td>{data.length}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            }
        </div>
    )
}