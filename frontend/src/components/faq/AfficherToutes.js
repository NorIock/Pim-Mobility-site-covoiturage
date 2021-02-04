import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../middlewares/Requete';

export default function AfficherToutesFAQ(){

    const [data, setData] = useState([]);

    const history = useHistory();

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/FAQ/afficher-toutes",
            )
            setData(result.data);
        };
        fetchData();
    }, []);

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{marginTop: "80px", textAlign: "center"}}>Chargement</h3>
            )
            : data === "Queud" ? (
                <div className="container card">
                    <h3 style={{textAlign: "center"}}>Pas de FAQ pour le moment</h3>
                </div>
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>FAQ</th>
                            </tr>
                        </thead>
                        {data.map(faq =>(
                            <tr key={faq._id} className="hover-ponctuel" onClick={()=>history.push("/faq/afficher-une/" + faq._id)}>
                                <td><h4>{faq.sujet}</h4></td>
                            </tr>
                        ))}
                    </table>
                </div>
            )}
        </div>
    )
}