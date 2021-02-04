import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
// import { url } from '../../../middlewares/Constantes';
// import axios from 'axios';

export default function AfficherDepart(props){ // Props permet de récupérer la variable du parent

    const [data, setData] = useState([]);

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/departs/afficher",
            );
            setData(result.data);
        };
        fetchData();
    }, [props.toChild]);

    return(
        <div>
            <table className="table table-striped">
                <tbody>
                    {data.map((depart) =>
                        <tr key={depart._id}>
                            <td>{depart.nom}</td>
                            <td><Link to={"/admin/departs/modifier/" + depart._id}>modifier</Link></td>
                            <td><Link to={"/admin/departs/supprimer/" + depart._id}>supprimer</Link></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}