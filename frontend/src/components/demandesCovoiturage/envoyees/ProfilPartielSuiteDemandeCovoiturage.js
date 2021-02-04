import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function ProfilPartielSuiteDemandeCovoiturage(){

    const [data, setData] = useState([]);
    const { id, membreId } = useParams();

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                '/membres/afficher/' + id,
                { headers: { "x-auth-token": token } },
            );
            setData(result.data);
        }
        fetchData();
    }, [id, token])

    return(
        <div className="col-md-12">
            <div className="card card-container">
                <Link to={"/demandesCovoiturages/envoyees/" + membreId}>Retour</Link>
                <br></br>
                {data.map(membre => (
                    <div key={membre.id}>
                        <h5 key={membre.id}><strong>Prénom: </strong>{membre.prenom}</h5>

                        {membre.indisponible ? (
                            <h5 key={membre.id}><strong>Disponible: </strong>Pas pour le moment</h5>
                            ) : (
                                <h5 key={membre.id}><strong>Disponible: </strong>Oui</h5>
                        )}
                        <h5 key={membre.id}><strong>Rôle: </strong>{membre.role}</h5>
                        {membre.role !== "Je suis passager exclusif" &&
                            <h5 key={membre.id}><strong>Mode de paiement souhaité: </strong>{membre.mode_paiement}</h5>
                        }
                    </div>
                ))}
                <br></br>
                {data.map(membre => (
                    <div>
                        <h5><strong>Allers:</strong></h5>
                        {membre.trajets_aller.map(aller => (
                            <div key={aller.id}>
                                <h6 key={aller.id}>Part de: {aller.depart}</h6>
                                <h6 key={aller.id}>à {aller.heure_de_depart_en_string}</h6>
                                <h6 key={aller.id}>Pour: {aller.destination}</h6>
                                {membre.role !== "Je suis passager exclusif" &&
                                    <h6 key={aller.id}>Places disponibles: {aller.nombre_de_places}</h6>
                                }
                                <br />
                            </div>
                        ))}
                    </div>
                ))}
                {data.map(membre => (
                    <div>
                        <h5><strong>Retours:</strong></h5>
                        {membre.trajets_retour.map(retour => (
                            <div key={retour.id}>
                                <h6 key={retour.id}>Part de: {retour.depart}</h6>
                                <h6 key={retour.id}>à {retour.heure_de_depart_en_string}</h6>
                                <h6 key={retour.id}>Pour: {retour.destination}</h6>
                                {membre.role !== "Je suis passager exclusif" &&
                                    <h6 key={retour.id}>Places disponibles: {retour.nombre_de_places}</h6>
                                }
                                <br />
                            </div>
                        ))}
                    </div>
                ))}
                <Link to={"/demandesCovoiturages/envoyees/" + membreId}>Retour</Link>
            </div>   
        </div>
    )
}