import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../middlewares/Requete';

export default function AfficherUneFAQ(){

    const [data, setData] = useState([]);
    
    const { faqId } = useParams();

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/FAQ/afficher-une/" + faqId,
            )
            setData(result.data);
        }
        fetchData();
    }, [faqId])

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement...</h3>
            ): (
                <div style={{marginTop: "80px"}} className="container">
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}><h4>{data.sujet}</h4></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    {data.paragraphe.map(paragraphes =>(
                                        <div key={paragraphes._id}>
                                            <h4>{paragraphes.paragraphe}</h4>
                                            <br></br>
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <h4 style={{textAlign: "center"}}><Link to={"/FAQ/afficher-toutes"}>Retour</Link></h4>
                </div>
            )}
        </div>
    )

}