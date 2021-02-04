import React, { useState } from 'react';

import AfficherNombrePlacesPassagers from './Afficher';
import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function AjouterNombrePlacesPassagers(){

    const [nombre, setNombre] = useState();
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
            const newPlace = { nombre };

            await Requete.post(
                "/nombrePlacesPassagers/ajouter",
                newPlace,
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
                    <label><h3>Indiquer le nombre de places possible </h3></label>
                    <input
                        className='form-control'
                        type='text'
                        placeholder="indiquez le nombre"
                        onChange={(e)=>setNombre(e.target.value)}
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
                <AfficherNombrePlacesPassagers toChild={toChild}/>
            </div>
        </div>
    )
}