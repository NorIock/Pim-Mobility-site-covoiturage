import React, { useState } from 'react';

import AfficherConducteurPassager from './Afficher';
import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function AjouterConducteurPassager(){

    const [type, setType] = useState();
    const [error, setError] = useState();
    // toChild sera modifiée à chaque fois que l'on clique sur submit (ligne 25) et envoyé au child component Afficher.js (ligne67)
    // Permet d'actualiser useEffect à chaque fois que l'on ajoute une donnée et pas en continu
    const [toChild, setToChild] = useState(0);

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    const submit = async function(e){
        e.preventDefault();
        
        try{
            const newPassagerConducteur = { type };
            await Requete.post(
                "/conducteursPassagers/ajouter",
                newPassagerConducteur,
                { headers: { "x-auth-token": token } }
            )

            setToChild(toChild*1 + 1);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    };

    return(
        <div className="container" style={{marginTop: "80px"}}>
        <form onSubmit={submit}>
            <div className='form-group'>
                <label><h3>Ajouter une nouvelle option passager/conducteur:</h3></label>
                <h6 style={{color: "red"}}>Pour le bon fonctionnement du matching, les Rôles suivants doivent exister à l'identique dans la base de donnée:</h6>
                <div style={{color: "red", marginLeft: "30px", marginBottom: "20px"}}>
                    <li>Je suis conducteur exclusif</li>
                    <li>Je suis conducteur mais disposé à me mettre en passager</li>
                    <li>Je suis passager exclusif</li>
                    <li>Je suis passager et conducteur occasionnel</li>
                </div>
                <input
                    type='text'
                    className='form-control'
                    placeholder="Nouvelle option:"
                    onChange={(e)=> setType(e.target.value)}
                />
            </div>
            <div className='form-group' style={{marginTop: "20px"}}>
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
            <AfficherConducteurPassager toChild={toChild}/>
        </div>
    </div>
    )
}