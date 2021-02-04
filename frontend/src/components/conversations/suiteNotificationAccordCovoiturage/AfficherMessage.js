import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherMessageAccordCovoiturageSuiteNotification(){

    const [data, setData] = useState([]);
    const { id } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/notifications/message/afficher-un/" + id,
                { headers: { "x-auth-token": token } },
            )
            setData(result);
        }
        fetchData(id, token);
    }, [id, token])

    return(
        <div>
            {data.length === 0 ? (
                <p>chargement....</p>
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    <div style={{ border: "5px solid #317681", marginTop: "5px", borderRadius: "20px" }}>
                        <h4 style={{ textDecoration: "underline", margin: "10px" }}>Envoyé par {data.data.message.prenom} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(new Date(data.data.message.date))}</h4>
                        <h3 style={{ marginLeft: "5px" }}>{data.data.message.texte}</h3>
                    </div>
                    <div>
                        <h4 style={{ float: 'left' }}><Link to={"/conversation/notification/message/" + data.data.message._id + "/" + data.data.membre_notif_id}>Répondre</Link></h4>
                        <h4 style={{ float: 'right' }}><Link to={"/"}>Retour</Link></h4>
                    </div>
                </div>
            )}
        </div>
    )
}