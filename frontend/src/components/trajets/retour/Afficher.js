import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherTrajetsRetourDunMembre(){

    const [data, setData]= useState([]);
    const [noData, setNoData] = useState(false);

    const { id } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{

        async function fetchData(){
            const result = await Requete.get(
                "/trajetsRetour/afficher/" + id,
                { headers: { "x-auth-token": token } },
            );
            if(result.data.length === 0){
                setNoData(true);
            } else {
                setNoData(false);
            }
            setData(result.data);
        };
        fetchData()
    }, [id, token])

    return(

        <div className="container">
            {noData === true &&  // S'il n'y a pas de résultats'
                <div className="card">
                    <h3 style={{textAlign: "center"}}>Vous n'avez pas encore enregistré de trajets retour</h3>
                </div>
            }
            {data.map(trajetsRetour => (
                <div key={trajetsRetour.id} className="card">
                    <h5 className="card-header" key={trajetsRetour.id}><strong>{trajetsRetour.jour}</strong></h5>
                    <div key={trajetsRetour.id} className="card-body">
                        <p key={trajetsRetour.id} className= "card-text">Part de {trajetsRetour.depart} pour {trajetsRetour.destination} à {trajetsRetour.heure_de_depart_en_string}</p>
                        <p key={trajetsRetour.id} className= "card-text">Places disponibles: {trajetsRetour.nombre_de_places}</p>
                        <p><Link to={"/trajet/aller/modifier/" + trajetsRetour._id + "/" + id}>modifier</Link></p>
                    </div>
                </div>
            ))}
        </div>
    )
}