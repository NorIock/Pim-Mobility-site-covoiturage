import React, { useState, useEffect} from 'react';
import { useParams, useHistory, Link} from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from "../../misc/ErrorNotice";

export default function SupprimerMotifsRefusDemandeDeCovoiturage(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();
    const { motif, id }= useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token"); // Permet de récupérer le token afin de l'envoyer dans la requête
    if(token === null){ // S'il n'y a pas de token dans le local storage, cela crée une erreur. Avec ce if, cela nous permet que s'il est null lui attribuer une valeur et éviter une erreur
        localStorage.setItem("auth-token", "");
        token="";
    }

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/motifsRefusDemandeDeCovoiturage/afficher-un/" + id
            );
            setData(result.data);
        };
        fetchData();
    }, [motif, id]);

    const supprimer = async function(){

        try{
            await Requete.delete(
                "/motifsRefusDemandeDeCovoiturage/supprimer/" + id,
                { headers: { "x-auth-token": token } }, // Doit être en dernier pour éviter tout problème de token lors de la validation
            )
            history.push("/admin/motif-suite-refus-demande-de-covoiturage/gerer");
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="admin-display">
        {data === null ? (
            history.push("/admin/motif-suite-refus-demande-de-covoiturage/gerer")
        ) : (
            <div>
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                <h4>Souhaitez-vous supprimer ce motif de refus de covoiturage: <strong>{data.motif}</strong> ?</h4>
                <button onClick={() => supprimer()} className="btn btn-danger">Supprimer</button>
                <p><Link to="/admin/motif-suite-refus-demande-de-covoiturage/gerer">Retour</Link></p>
            </div>
        )}
        </div>
    )
}