import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherConversationAvecAdministrateur(props){

    const [data, setData] = useState([]);
    
    const { membreId } = useParams();

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/discussionAvecAdministrateur/afficher-une/" + membreId,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();
    }, [token, membreId, props.refresh]);

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement</h3>
            ) : data === "Queud" ? (
                <h3 style={{marginTop: "80px", textAlign: "center"}}>Pas encore de conversation avec un administrateur</h3>
            ) : (
                <div className = "container" style={{marginTop: "80px"}}>
                    <h3 style={{textAlign: "center"}}>Participants: <Link to={"/membre/" + data.membre_id}>{data.membre_prenom}</Link>, administrateur</h3>
                    {data.messages.map(message =>
                        <div key={message._id}>
                        {props.membreId === message.prenom_id ? (
                            <div className="col-8" style={{ border: "2px solid #317681", marginTop: "5px", float: "right", background: "#317681", color: "whitesmoke", borderRadius: "10px" }}>
                                <h5 style={{textDecoration: "underline"}}>{message.prenom} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(message.date))}</h5>
                                <h3>{message.texte}</h3>
                                <br></br>
                            </div>
                        ) : 
                        props.membreId !== message.prenom_id ? (
                            <div className="col-8" style={{ border: "2px solid #317681", marginTop: "5px", float: "left", borderRadius: "10px" }}>
                                <h5 style={{textDecoration: "underline"}}>{message.prenom} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(message.date))}</h5>
                                <h3>{message.texte}</h3>
                                <br></br>
                            </div>
                        ) : null
                        }
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}