import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';
import AfficherConversationSuiteNotification from './AfficherConversation';

export default function EcrireMessageSuiteNotification(){

    const [texte, setTexte] = useState([]);
    const [error, setError] = useState();
    // refresh sera modifiée à chaque fois que l'on clique sur submit (ligne 24) et envoyé au child component AfficherConversationSuiteNotification (ligne43)
    // Permet d'actualiser useEffect à chaque fois que l'on ajoute une donnée et pas en continu
    var [refresh, setRefresh] = useState(0);
    const { messageId, membreId } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    const submit = async function(e){
        e.preventDefault();

        try{
            const nouveauMessage = { texte };

            await Requete.post(
                "/notifications/conversation-suite-message/repondre/" + messageId + "/" + membreId,
                nouveauMessage,
                { headers: { "x-auth-token": token } },
            )

            setRefresh(refresh*1 + 1);
            setTexte("");

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }

    }
    return(
        <div classname="container" style={{marginTop: "20px"}}>
            <AfficherConversationSuiteNotification membreId={membreId} messageId={messageId} refresh={refresh}/>
            <div className="container">
                <form onSubmit={submit}>
                    <div className="form-group">
                        <textarea
                            type="text"
                            className="form-control"
                            placeholder="Nouveau message"
                            rows={5}
                            onChange={(e) => setTexte(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="submit"
                            className="btn btn-primary"
                            value="Envoyer"
                        />
                    </div>
                    {error && (
                        <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                    )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                </form>
                <h3 style={{textAlign: "center"}}><Link to={"/"}>Retour</Link></h3>
            </div>
        </div>
    )
}