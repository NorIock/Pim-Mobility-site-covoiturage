import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherConducteurPassager(props){ // Props permet de récupérer la variable du parent

    const [data, setData] = useState([]);

    useEffect(function(){
        async function fetchData(){
            const result = await Requete.get(
                "/conducteursPassagers/afficher",
            );
            setData(result.data);
        }
        fetchData();
    }, [props.toChild]);
    // });

    return(
        <div>
            <h3>Liste des options conducteurs/passagers:</h3>
            <table className="table table-striped">
                <tbody>
                {data.map((option) =>
                    <tr key={option._id}>
                        <td>{option.type}</td>
                        <td><Link to={"/admin/conducteurs-passagers/modifier/" + option._id}>modifier</Link></td>
                        <td><Link to={"/admin/conducteurs-passagers/supprimer/" + option._id}> supprimer</Link></td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}