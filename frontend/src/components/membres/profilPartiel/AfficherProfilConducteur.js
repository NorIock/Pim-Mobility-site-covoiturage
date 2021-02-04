import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherProfilPartielConducteur(){
    
    const [data, setData] = useState([]);
    const [vientDe] = useState("pc");

    const { conducteurId, membreId }= useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token")
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                '/membres/afficher/' + conducteurId,
                { headers: {"x-auth-token": token } },
            )
            setData(result);
        }
        fetchData();
    }, [token, conducteurId])

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{verticalAlign: "middle", textAlign: "center"}}>Chargement...</h3>    
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>Conducteur: {data.data[0].prenom}</th>
                            </tr>
                        </thead>
                        {data.data.map(membre => (
                            <tbody key={membre._id}>
                                <tr>
                                    <td>
                                        <h5><strong>Nom: </strong>{membre.nom}</h5>
                                        <h5><strong>Prénom: </strong>{membre.prenom}</h5>
                                        <h5><strong>Rôle: </strong>{membre.role}</h5>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{display: "flex",justifyContent: "space-between", alignItems: "center"}}>
                                        <button 
                                            className="button-envoyer-message-profil-partiel"
                                            onClick={()=>{history.push("/conversation-individuelle/envoyer/" + conducteurId + "/" + membreId)}}
                                        >Envoyer un message
                                        </button>
                                        <button 
                                            className="button-supprimer-du-covoiturage-profil-partiel"
                                            onClick={()=>{history.push("/tous-mes-covoiturage-avec-un-conducteur/" + membreId + "/" + conducteurId + "/" + membre.prenom + "/" + vientDe)}}
                                        >Quitter un ou plusieurs trajets de {membre.prenom}
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        ))}
                    </table>
                    <h4 style={{textAlign: "center"}}><Link to={"/mesCovoiturages/" + membreId}>Retour</Link></h4>
                </div>
            )}
        </div>
    )

}