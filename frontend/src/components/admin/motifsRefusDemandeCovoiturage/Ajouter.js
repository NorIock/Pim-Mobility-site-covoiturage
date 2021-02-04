import React, { useState } from 'react';

import AfficherMotifsRefusDemandeDeCovoiturage from './Afficher';
import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function AjouterMotifsRefusDemandeDeCovoiturage(){

    const [motif, setMotif]= useState();
    const [error, setError] = useState();
    // toChild sera modifiée à chaque fois que l'on clique sur submit (ligne 25) et envoyé au child component Afficher.js (ligne67)
    // Permet d'actualiser useEffect à chaque fois que l'on ajoute une donnée et pas en continu
    const [toChild, setToChild] = useState(0);
  
    let token = localStorage.getItem("auth-token"); // Permet de récupérer le token afin de l'envoyer dans la requête
    if(token === null){ // S'il n'y a pas de token dans le local storage, cela crée une erreur. Avec ce if, cela nous permet que s'il est null lui attribuer une valeur et éviter une erreur
        localStorage.setItem("auth-token", "");
        token="";
    }

    const submit = async function(e){
        e.preventDefault();

        try {
            const newMotif = { motif };
            await Requete.post(
                '/motifsRefusDemandeDeCovoiturage/ajouter',
                newMotif,
                { headers: { "x-auth-token": token } }
            );

            setToChild(toChild*1 + 1);
            
        } catch(err) {
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    };

    return(
        <div className="container" style={{marginTop: "80px"}}>
            <form onSubmit={submit}>
                <div className='form-group'>
                    <label><h3>Ajouter un motif:</h3></label>
                    <input
                        type='text'
                        className='form-control'
                        placeholder="Motif à ajouter"
                        onChange={(e)=> setMotif(e.target.value)}
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
                <AfficherMotifsRefusDemandeDeCovoiturage toChild={toChild}/>
            </div>
        </div>
    )
}