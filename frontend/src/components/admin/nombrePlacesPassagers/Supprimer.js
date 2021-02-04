import React, { useState, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function SupprimerNombrePlacesPassagers(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();

    const history = useHistory();
    const { id } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        
        async function fetchData(){
            const result = await Requete.get(
                "/nombrePlacesPassagers/afficher-un/" + id,
            );
            setData(result.data);
        };
        fetchData();
    }, [id]);

    const supprimer = async function(){

        try{
            await Requete.delete(
                "/nombrePlacesPassagers/supprimer/" + id,
                { headers: { "x-auth-token": token } }
            );
            history.push("/admin/nombre-places-passagers/gerer")
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="admin-display">
            {data === null ? (
                history.push("/admin/nombre-places-passagers/gerer")
            ) : (
                <div>
                    {error && (
                        <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                    )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                    <h4>Souhaitez-vous supprimer cette donnée: <strong>{data.nombre}</strong> ?</h4>
                    <button
                        className='btn btn-danger'
                        onClick={()=>supprimer()}
                    >Supprimer</button>
                    <p><Link to="/admin/nombre-places-passagers/gerer">Retour</Link></p>
                </div>
            )}
        </div>
    )
}