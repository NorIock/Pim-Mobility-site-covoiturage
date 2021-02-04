import React, { useState } from 'react';

import AfficherHeure from './Afficher';
import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function AjouterHeure(){

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
            const newHeure = { chiffre };

            await Requete.post(
                "/heures/ajouter",
                newHeure,
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
                    <label><h3>Indiquer le chiffre qui servira à l'utilisateur à choisir l'heure </h3></label>
                    <div style={{color: "red", marginBottom: "30px"}}>
                        <h6>Indiquer uniquement l'heure sans les minutes: 00, 01, 02, ... , 22, 23</h6>
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
                <AfficherHeure toChild={toChild}/>
            </div>
        </div>
    )
}