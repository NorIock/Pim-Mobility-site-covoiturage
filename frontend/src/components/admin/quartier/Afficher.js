import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherQuartier(props){

    const [data, setData] = useState([]);
    const history = useHistory();

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/quartier/afficher/" + props.departOuDestination + "/" + props.id,
            );
            setData(result.data);
        };
        fetchData();
    }, [props.toChild, props.departOuDestination, props.id]);

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement...</h3>
            ) : (
            <div style={{marginTop: "50px"}}>
                <table className="table affichage-profil">
                    <thead>
                        <tr>
                            <th style={{textAlign: "center"}}>
                                <h4>{data.quartiers.length < 2 ? <span>Quartier enregistré</span> : <span>Quartiers enregistrées</span>} pour {data.nom}:</h4>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.quartiers.map((quartier) =>
                            <tr key={quartier._id} className="hover-ponctuel" onClick={()=>history.push("/admin/quartier/modifier/" + quartier._id + "/" + props.departOuDestination + "/" + props.id)}>
                                <td>
                                    <h5>{quartier.nom_quartier}</h5>
                                    {/* <h5><Link to={"/admin/quartier/modifier/" + quartier._id}>modifier</Link></h5>
                                    <h5><Link to={"/admin/quartier/supprimer/" + quartier._id}> supprimer</Link></h5> */}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    )
}