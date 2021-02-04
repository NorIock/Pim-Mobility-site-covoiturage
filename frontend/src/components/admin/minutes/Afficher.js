import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherMinute(props){

    const [data, setData] = useState([]);

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/minutes/afficher",
            );
            setData(result.data);
        };
        fetchData();
    }, [props.toChild]);

    return(
        <div>
            <h3>Liste des minutes enregistrées:</h3>
            <table className="table table-striped">
                <tbody>
                {data.map((minute) =>
                    <tr key={minute._id}>
                        <td>{minute.chiffre}</td>
                        <td><Link to={"/admin/minutes/modifier/" + minute._id}>modifier</Link></td>
                        <td><Link to={"/admin/minutes/supprimer/" + minute._id}> supprimer</Link></td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}