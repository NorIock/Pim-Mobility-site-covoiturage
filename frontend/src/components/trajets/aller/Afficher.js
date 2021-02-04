import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherTrajetsAllerDunMembre(){

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
                "/trajetsAller/afficher/" + id,
                { headers: { "x-auth-token": token } },
            );
            if(result.data.length === 0){ // Affiche un message s'il n'y a pas de résultats
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
                    <h3 style={{textAlign: "center"}}>Vous n'avez pas encore enregistré de trajets aller</h3>
                </div>
            }
            {data.map(trajetsAller => (
                <div key={trajetsAller.id} className="card">
                    <h5 className="card-header" key={trajetsAller.id}><strong>{trajetsAller.jour}</strong></h5>
                    <div key={trajetsAller.id} className="card-body">
                        <p key={trajetsAller.id} className= "card-text">Part de {trajetsAller.depart} pour {trajetsAller.destination} à {trajetsAller.heure_de_depart_en_string}</p>
                        <p key={trajetsAller.id} className= "card-text">Places disponibles: {trajetsAller.nombre_de_places}</p>
                        <p><Link to={"/trajet/aller/modifier/" + trajetsAller._id + "/" + id}>modifier</Link></p>
                    </div>
                </div>
            ))}
        </div>
    )
}