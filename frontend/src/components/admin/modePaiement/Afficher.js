import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherModePaiement(props){

    const [data, setData] = useState([]);

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/modesPaiement/afficher"
            );
            setData(result.data);
        };
        fetchData();
    }, [props.toChild]);

    return(
        <div>
            <h3>Liste des modes de paiement</h3>
            <table className="table table-striped">
                <tbody>
                {data.map((mode) =>
                    <tr key={mode._id}>
                        <td>{mode.type}</td>
                        <td><Link to={"/admin/modes-paiement/modifier/" + mode._id}>modifier</Link></td>
                        <td><Link to={"/admin/modes-paiement/supprimer/" + mode._id}> supprimer</Link></td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}