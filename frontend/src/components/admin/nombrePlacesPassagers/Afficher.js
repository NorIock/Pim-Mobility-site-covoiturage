import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherNombrePlacesPassagers(props){

    const [data, setData] = useState([]);

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/nombrePlacesPassagers/afficher"
            );
            setData(result.data);
        }
        fetchData();
    }, [props.toChild]);

    return(
        <div>
        <h3>Liste des nombres de places passagers possible enregistrées:</h3>
            <table className="table table-striped">
                <tbody>
                {data.map((nombrePlace) =>
                    <tr key={nombrePlace._id}>
                        <td>{nombrePlace.nombre}</td>
                        <td><Link to={"/admin/nombre-places-passagers/modifier/" + nombrePlace._id}>modifier</Link></td>
                        <td><Link to={"/admin/nombre-places-passagers/supprimer/" + nombrePlace._id}> supprimer</Link></td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}