import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';

import ErrorNotice from '../../misc/ErrorNotice';
import Requete from '../../../middlewares/Requete';

export default function ModifierDestination(){

    const [data, setData] = useState([]);
    const [nom, setNom] = useState();
    const [error, setError] = useState();

    const history = useHistory();
    const { id } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token="";
    }

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/destinations/afficher-une/" + id,
            );
            setData(result.data);
        }
        fetchData();
    }, [id]);

    const submit = async function(e){
        e.preventDefault();

        try {
            const majDestination = { nom };
            await Requete.put(
                "/destinations/modifier/" + id,
                majDestination,
                { headers: { "x-auth-token": token } }, // Doit être en dernier pour éviter tout problème de token lors de la validation
            )
            history.push("/admin/destinations/gerer");

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="admin-display">
            <form onSubmit={submit}>
                <div className="form-group">
                    <label><h3>Modification à effectuer:</h3></label>
                    <input
                        type='text'
                        placeholder={data.nom}
                        defaultValue={data.nom}
                        className='form-control'
                        onChange={(e) => setNom(e.target.value)}
                    />
                </div>
                <div className='form-group'>
                    <input
                        type='submit'
                        value='Modifier'
                        className='btn btn-primary'
                    />
                </div>
                {error && (
                <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
            </form>
            <div>
                <Link to="/admin/destinations/gerer">Retour</Link>
            </div>
        </div>
    )
}