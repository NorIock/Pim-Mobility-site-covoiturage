import React, {useState, useEffect } from 'react';

import Requete from '../../../../middlewares/Requete';

export default function AfficherUneConversationDepuisNavbar(props){

    const [data, setData] = useState([]);

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/discussionIndividuelle/afficher-une-depuis-liste/" + props.conversationId,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();
    }, [token, props.conversationId, props.refresh]);

    return(
        <div>
            {data.length === 0 ? (
                <div className="container" style={{marginTop: "80px"}}>
                    <h3>Chargement...</h3>
                </div>
            ) : (
                <div className = "container" style={{marginTop: "80px"}}>
                    <h3 style={{textAlign: "center"}}>Participants: {data.participant1_prenom}, {data.participant2_prenom}</h3>
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