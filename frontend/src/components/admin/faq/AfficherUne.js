import React, { useState, useEffect } from 'react';
import { useHistory, Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AdminAfficherUneFAQ(){

    const [data, setData] = useState([]);
    const [from] = useState("depuis afficher");
    
    const history = useHistory();
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
                                <th style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                    <span><h6 style={{cursor: "pointer"}} onClick={()=>history.push("/admin/faq/modifier/sujet/" + faqId + "/" + from)}>Modifier titre</h6></span>
                                    <span><h4>{data.sujet}</h4></span>
                                    <span><h6 style={{cursor: "pointer"}} onClick={()=>history.push("/admin/faq/supprimer/sujet/" + faqId + "/" + from)}>Supprimer</h6></span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.paragraphe.map(paragraphes =>(
                                <tr key={paragraphes._id}>
                                    <td>
                                        <h4>{paragraphes.paragraphe}</h4>
                                        <br></br>
                                        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                            <h6><Link to={"/admin/paragraphe/modifier/" + paragraphes._id + "/" + from + "/" + faqId}>Modifier</Link></h6>
                                            <h6><Link to={"/admin/paragraphe/supprimer/" + paragraphes._id + "/" + from + "/" + faqId}>Supprimer</Link></h6>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h4 style={{textAlign: "center"}}><Link to={"/admin/faq/gerer"}>Retour</Link></h4>
                </div>
            )}
        </div>
    )
}