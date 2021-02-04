import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from '../../../../middlewares/Requete';
import ErrorNotice from '../../../misc/ErrorNotice';
import AfficherUneConversationDepuisNavbar from './AfficherUne';

export default function EcrireMessageDepuisNavbar(){

    const [texte, setTexte] = useState();
    // Permet d'envoyer une variable au child pour que son useEffect se relance quand on envoie un message
    const [refresh, setRefresh] = useState(0);
    const [error, setError] = useState();

    const { conversationId, membreId } = useParams();

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
                "/discussionIndividuelle/message/depuis-navbar/" + conversationId + "/" + membreId,
                nouveauMessage,
                { headers: { "x-auth-token": token } },
            )
            setTexte("");
            setRefresh(refresh*1 + 1);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="container" style={{marginTop: "20px"}}>
            <AfficherUneConversationDepuisNavbar membreId={membreId} refresh={refresh} conversationId={conversationId} />
            <div className="container" style={{marginTop: "20px"}}>
                <form onSubmit={submit}>
                    <div className="form-group">
                        <textarea
                            type="text"
                            className="form-control"
                            placeholder="Votre message..."
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
                <h4 style={{textAlign: "center"}}><Link to={"/mesconversations-individuelles/" + membreId}>Retour</Link></h4>
            </div>
        </div>
    )
}