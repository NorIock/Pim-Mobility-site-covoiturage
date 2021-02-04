import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function SupprimerActualite(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();
    
    const { actualiteId } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token"); // Permet de récupérer le token afin de l'envoyer dans la requête
    if(token === null){ // S'il n'y a pas de token dans le local storage, cela crée une erreur. Avec ce if, cela nous permet que s'il est null lui attribuer une valeur et éviter une erreur
        localStorage.setItem("auth-token", "");
        token="";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/actualites/afficher-une-pour-maj/" + actualiteId,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();
    }, [token, actualiteId]);

    const supprimer = async function(){

        try{
            await Requete.delete(
                "/actualites/supprimer/" + actualiteId,
                { headers: { "x-auth-token": token } }, // Doit être en dernier pour éviter tout problème de token lors de la validation
            )
            history.push("/admin/actualites/afficher-toutes");
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="admin-display">
        {data.length === 0 ?
            <h3 style={{textAlign: "center", marginTop: "100px"}}>Chargement...</h3>
        :
        data === null ? (
            history.push("/admin/actualites/afficher-toutes")
        ) : (
            <div>
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                <h4>Souhaitez-vous supprimer cette actualité: ?</h4>
                <h4><strong>Type: </strong>{data.type}</h4>
                <h4><strong>Créée le: </strong>{new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(data.date))}</h4>
                <h4><strong>Titre: </strong>{data.titre}</h4>
                <h4><strong>Contenu: </strong>{data.contenu}</h4>

                <button onClick={() => supprimer()} className="btn btn-danger">Supprimer</button>
                <p><Link to="/admin/actualites/afficher-toutes">Retour</Link></p>
            </div>
        )}
        </div>
    )

}