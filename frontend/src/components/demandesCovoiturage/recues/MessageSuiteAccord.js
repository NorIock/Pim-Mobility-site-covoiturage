import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function MessageSuiteAccordDemandeCovoiturage(){

    const [messageAccord, setMessageAccord] = useState();
    const [error, setError] = useState();
    const { id, aller_ou_retour, prenom } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    const submitOui = async function(e){
        try{
            e.preventDefault();

            const messageEnvoye = { messageAccord };

            await Requete.post(
                "/discussionIndividuelle/creer/" + id,
                messageEnvoye,
                { headers: { "x-auth-token": token } }
            );
            // history.push sur la demande de covoiturage au cas où il n'a pas tout validé en une fois
            history.push("/demandesCovoiturages/recues/" + id + "/" + aller_ou_retour);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    const submitNon = async function(e){
        try{
            e.preventDefault();
            // history.push sur la demande de covoiturage au cas où il n'a pas tout validé en une fois
            history.push("/demandesCovoiturages/recues/" + id + "/" + aller_ou_retour);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="container">
            <h3 style={{marginTop: "80px", textAlign: "center"}}>Voulez-vous envoyer un message à {prenom} ?</h3>
            <div className='form-group'>
                <label>Votre message:</label>
                <textarea
                    type="text"
                    className="form-control"
                    rows={5}
                    placeholder="Vous pouvez donner votre email, numéro de téléphone, des détails concernant votre trajet..."
                    onChange={(e)=> setMessageAccord(e.target.value)}
                />
            </div>
            {error && (
                <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
            <br></br>
            <div>
                <input
                    type='submit'
                    value='Envoyer message'
                    className='btn btn-primary'
                    onClick={submitOui}
                />
                <input
                    type='submit'
                    value='Pas de message'
                    className='btn btn-danger float-right'
                    onClick={submitNon}
                />
                <p></p>
            </div>
        </div>
    )
}