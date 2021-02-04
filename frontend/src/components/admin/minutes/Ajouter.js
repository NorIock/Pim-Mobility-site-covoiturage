import React, { useState } from 'react';

import AfficherMinute from './Afficher';
import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function AjouterMinute(){

    const [chiffre, setChiffre] = useState();
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
            const newMinute = { chiffre };

            await Requete.post(
                "/minutes/ajouter",
                newMinute,
                { headers: { "x-auth-token": token } }
            );

            setToChild(toChild*1 + 1);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg);
        }
    };

    return(
        <div className="container" style={{marginTop: "80px"}}>
            <form onSubmit={submit}>
                <div className='form-group'>
                    <label><h3>Indiquer le chiffre qui servira à l'utilisateur à choisir la minute </h3></label>
                    <div style={{color: "red", marginBottom: "30px"}}>
                        <h6>Indiquer uniquement les minutes sans les heures avec l'écart que vous souhaitez: 00, 05, 10, ... , 50, 55</h6>
                        <h6>Le programme se chargera d'afficher l'heure sous le format heure h minute (09h45 par exemple)</h6>
                    </div>
                    <input
                        className='form-control'
                        type='text'
                        placeholder="indiquez le chiffre"
                        onChange={(e)=>setChiffre(e.target.value)}
                    />
                </div>
                <div className='form-group'>
                    <input
                        type='submit'
                        className='btn btn-primary'
                        value='Ajouter'
                    />
                </div>
                {error && (
                <ErrorNotice message={error} clearError={()=> setError(undefined)} />
            )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
            </form>
            <div>
                <AfficherMinute toChild={toChild} />
            </div>
        </div>
    )
}