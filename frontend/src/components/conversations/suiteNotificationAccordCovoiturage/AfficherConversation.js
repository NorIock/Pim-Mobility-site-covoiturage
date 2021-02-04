import React, { useState, useEffect } from 'react';

import Requete from '../../../middlewares/Requete';

export default function AfficherConversationSuiteNotification(props){

    const [data, setData]= useState([]);

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/notifications/conversation-suite-message/" + props.messageId,
                { headers: { "x-auth-token": token } },
            )
            setData(result);
        }
        fetchData();
    }, [props.messageId, token, props.refresh])

    return(
        <div>
            {data.length === 0 ? (
                <p>Chargement...</p>
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    {data.data.map(conversation => (
                        <div>
                            <h3 style={{textAlign: "center"}}>Participants: {conversation.participant1_prenom}, {conversation.participant2_prenom}</h3>
                            <div key={conversation._id}>
                                {conversation.messages.map(message => (
                                    props.membreId === message.prenom_id ?
                                    <div className="col-8" style={{ border: "2px solid #317681", marginTop: "5px", float: "right", background: "#317681", color: "whitesmoke", borderRadius: "10px" }}>
                                        <h5 style={{textDecoration: "underline"}}>{message.prenom} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(message.date))}</h5>
                                        <h3>{message.texte}</h3>
                                        <br></br>
                                    </div>
                                    :
                                    props.membreId !== message.prenom_id ? 
                                    <div className="col-8" style={{ border: "2px solid #317681", marginTop: "5px", float: "left", borderRadius: "10px" }}>
                                        <h5 style={{textDecoration: "underline"}}>{message.prenom} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(message.date))}</h5>
                                        <h3>{message.texte}</h3>
                                        <br></br>
                                    </div>
                                    : null
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}