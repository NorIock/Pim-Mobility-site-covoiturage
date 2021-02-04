import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherCommune(props) { // Props permet de récupérer la variable du parent

    const [data, setData] = useState([]);

    let token = localStorage.getItem("auth-token"); // Permet de récupérer le token afin de l'envoyer dans la requête
    if(token === null){ // S'il n'y a pas de token dans le local storage, cela crée une erreur. Avec ce if, cela nous permet que s'il est null lui attribuer une valeur et éviter une erreur
        localStorage.setItem("auth-token", "");
        token="";
    }
    
    useEffect(function(){
        
        async function fetchData(){
            const result = await Requete.get(
                '/communesEntreprises/afficher',
            );
            setData(result.data);
        };
        fetchData();
    }, [props.toChild]);

    return(
        <div>
            <h3>Liste des communes d'entreprises</h3>
            <table className="table table-striped">
                <tbody>
                {data.map((commune) =>
                    <tr key={commune._id}>
                        <td key={commune._id}>{commune.nom}</td>
                        <td><Link to={"/admin/communes-entreprises/modifier/" + commune._id}>modifier</Link></td>
                        <td><Link to={"/admin/communes-entreprises/supprimer/" + commune._id}> supprimer</Link></td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}