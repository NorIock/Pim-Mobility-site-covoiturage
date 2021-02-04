import React, {useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Requete from '../../../../middlewares/Requete';

export default function AfficherToutesMesConversationsIndividuelles(){

    const [data, setData] = useState([]);
    const [noData, setNoData] = useState(false);
    const { id } = useParams();
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
                "/discussionIndividuelle/afficher-mes-discussions/" + id,
                { headers: { "x-auth-token": token } },
            )
            if(result.data === "Queud"){
                setNoData(true);
            }
            setData(result.data);
        }
        fetchData();
    }, [id, token])

    return(
        <div style={{marginTop: "80px"}}>
            {data.length === 0 ? (
                <h3 style={{marginTop: "30px", textAlign: "center"}}>Chargement...</h3>
            ) : (
                noData === true ?
                <div className="container">
                    <div className="container card">
                        <h3 style={{textAlign: "center"}}>Vous n'avez aucune conversation</h3>
                    </div>
                </div>
                :
                <div className="container">
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <td>
                                    <h4 style={{textAlign: "center"}}>Mes conversations</h4>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(conversation =>(
                                <tr key={conversation._id}>
                                    <td style={{cursor: "pointer"}} onClick={()=>history.push("/conversation/" + conversation._id + "/" + id)} className="hover-ponctuel">
                                        <div>
                                            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                                <h5>Avec {conversation.participant1_id === id && <span>{conversation.participant2_prenom}</span>}{conversation.participant2_id === id && <span>{conversation.participant1_prenom}</span>}</h5>
                                                <h6>Dernier message le: {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(conversation.messages[conversation.messages.length - 1].date))}</h6>
                                            </div>
                                            <h6><span style={{fontStyle: "italic"}}>{conversation.auteur_dernier_message}</span>: {conversation.dernier_message}</h6>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}