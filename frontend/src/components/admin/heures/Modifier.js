import React, { useState, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function ModifierHeure(){

    const [chiffre, setChiffre] = useState();
    const [data, setData] = useState([]);
    const [error, setError] = useState();

    const history = useHistory();
    const { id } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(function(){
        async function fetchData(){
            const result = await Requete.get(
                "/heures/afficher-une/" + id,
            );
            setData(result.data);
        };
        fetchData();
    }, [id]);

    const submit = async function(e){
        e.preventDefault();

        try{
            const modifierHeure = { chiffre };

            await Requete.put(
                "/heures/modifier/" + id,
                modifierHeure,
                { headers: { "x-auth-token": token } }
            );
            history.push("/admin/heures/gerer");

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    };

    return(
        <div className="admin-display">
            <form onSubmit={submit}>
                <div className="form-group">
                    <label>Quelles nouvelle valeur pour l'heure:</label>
                    <input
                        type='text'
                        placeholder='Indiquez la nouvelle heure'
                        className='form-control'
                        defaultValue={data.chiffre}
                        onChange={(e)=>setChiffre(e.target.value)}
                    />
                </div>
                <div className='form-group'>
                    <input
                        type='submit'
                        className='btn btn-primary'
                        value='Modifier'
                    />
                </div>
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
            </form>
            <div>
                <Link to="/admin/heures/gerer">Retour</Link>
            </div>
        </div>
    )
}