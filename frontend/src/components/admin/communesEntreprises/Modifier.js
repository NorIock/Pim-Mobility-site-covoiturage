import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom'; // Permet de remplacer le this.props.match.params.id que j'utilisais avec les classes

import Requete from '../../../middlewares/Requete';
import ErrorNotice from "../../misc/ErrorNotice";

export default function ModifierCommune(){

    const [data, setData] = useState([]);
    const [nom, setNom] = useState();
    const [error, setError] = useState();
    const { id } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token"); // Permet de récupérer le token afin de l'envoyer dans la requête
    if(token === null){ // S'il n'y a pas de token dans le local storage, cela crée une erreur. Avec ce if, cela nous permet que s'il est null lui attribuer une valeur et éviter une erreur
        localStorage.setItem("auth-token", "");
        token="";
    }

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/communesEntreprises/afficher-une/" + id
            );
            setData(result.data);
        };
        fetchData();
    }, [nom, id]);

    const submit = async function(e){
        e.preventDefault();

        try{
            const majCommune = { nom };
            await Requete.put(
                "/communesEntreprises/modifier/" + id,
                majCommune,
                { headers: { "x-auth-token": token } }, // Doit être en dernier pour éviter tout problème de token lors de la validation
            )
            history.push("/admin/communes-entreprises/gerer");

        } catch(err) {
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="admin-display">
            <form onSubmit={submit}>
                <div className='form-group'>
                    <label><h3>Modifier à effectuer:</h3></label>
                    <input
                        type='text'
                        className='form-control'
                        placeholder={data.nom}
                        defaultValue={data.nom}
                        onChange={(e)=> setNom(e.target.value)}
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
                <Link to="/admin/communes-entreprises/gerer">Retour</Link>
            </div>
        </div>
    )
}