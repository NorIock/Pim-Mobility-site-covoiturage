import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AdminAfficherActualite(props){

    const [data, setData] = useState([]);

    let token = localStorage.getItem("auth-token"); // Permet de récupérer le token afin de l'envoyer dans la requête
    if(token === null){ // S'il n'y a pas de token dans le local storage, cela crée une erreur. Avec ce if, cela nous permet que s'il est null lui attribuer une valeur et éviter une erreur
        localStorage.setItem("auth-token", "");
        token="";
    }

    useEffect(function(){
        
        async function fetchData(){
            const result = await Requete.get(
                '/actualites/admin/toutes',
                { headers: { "x-auth-token": token } },
            );
            setData(result.data);
        };
        fetchData();
    }, [props.toChild, token]);

    return(
        <div>
            <h3>Liste des actualitées</h3>
            <table className="table table-striped">
                <tbody>
                {data.map((actualite) =>
                    <tr key={actualite._id}>
                        <td style={{verticalAlign: "middle"}}><h5>{actualite.type} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(actualite.date))}</h5></td>
                        <td>
                            <h5 style={{textDecoration: "underline"}}>{actualite.titre}</h5>
                            <br></br>
                            <h5>{actualite.contenu}</h5>
                        </td>
                        <td><Link to={"/admin/actualitee/modifier/" + actualite._id}>modifier</Link></td>
                        <td><Link to={"/admin/actualitee/supprimer/" + actualite._id}>supprimer</Link></td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}