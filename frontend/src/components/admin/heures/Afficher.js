import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherHeure(props){

    const [data, setData] = useState([]);

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/heures/afficher",
            );
            setData(result.data);
        };
        fetchData();
    }, [props.toChild]);

    return(
        <div>
            <h3>Liste des heures enregistrées:</h3>
            <table className="table table-striped">
                <tbody>
                {data.map((heure) =>
                    <tr key={heure._id}>
                        <td>{heure.chiffre}</td>
                        <td><Link to={"/admin/heures/modifier/" + heure._id}>modifier</Link></td>
                        <td><Link to={"/admin/heures/supprimer/" + heure._id}> supprimer</Link></td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}