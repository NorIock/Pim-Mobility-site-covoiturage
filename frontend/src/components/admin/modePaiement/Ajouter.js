import React, { useState } from 'react';

import AfficherModePaiement from './Afficher';
import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function AjouterModePaiement(){

    const [type, setType] = useState();
    const [error, setError] = useState();
    // toChild sera modifiée à chaque fois que l'on clique sur submit (ligne 25) et envoyé au child component Afficher.js (ligne67)
    // Permet d'actualiser useEffect à chaque fois que l'on ajoute une donnée et pas en continu
    var [toChild, setToChild] = useState(0);

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    const submit = async function(e){
        e.preventDefault();

        try{
            const newModePaiement = { type };
            await Requete.post(
                "/modesPaiement/ajouter",
                newModePaiement,
                { headers: { "x-auth-token": token} }
            );

            setToChild(toChild*1 + 1);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    };

    return(
        <div className="container" style={{marginTop: "80px"}}>
        <form onSubmit={submit}>
            <div className='form-group'>
                <label><h3>Ajouter un mode de paiement:</h3></label>
                <input
                    type='text'
                    className='form-control'
                    placeholder="Mode de paiement à ajouter"
                    onChange={(e)=> setType(e.target.value)}
                />
            </div>
            <div className='form-group'>
                <input 
                    type='submit'
                    value='Ajouter'
                    className='btn btn-primary'
                />
            </div>
            {error && (
                <ErrorNotice message={error} clearError={()=> setError(undefined)} />
            )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
        </form>
        <div>
            <AfficherModePaiement toChild={toChild}/>
        </div>
    </div>
    )
}