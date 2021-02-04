import React, { useState, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import ErrorNotice from '../../misc/ErrorNotice';
import Requete from '../../../middlewares/Requete';

export default function SupprimerDestination(){

    const [data, setData] = useState([]);
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
                "/destinations/afficher-une/" + id
            )
            setData(result.data);
        };
        fetchData();
    }, [id]);

    const supprimer = async function(){

        try{
            await Requete.delete(
                "/destinations/supprimer/" + id,
                { headers: { "x-auth-token": token } }, // Doit être en dernier pour éviter tout problème de token lors de la validation
            )
            history.push("/admin/destinations/gerer");
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        };
    };

    return(
        <div className="admin-display">
        {data === null ? (
            history.push("/admin/nombre-places-passagers/gerer")
        ) : (
            <div>
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                <h4>Souhaitez-vous supprimer la destination <strong>{data.nom}</strong> ?</h4>
                <button onClick={supprimer} className="btn btn-danger">Supprimer</button>
                <p><Link to="/admin/destinations/gerer">retour</Link></p>
            </div>
        )}
        </div>
    )

}