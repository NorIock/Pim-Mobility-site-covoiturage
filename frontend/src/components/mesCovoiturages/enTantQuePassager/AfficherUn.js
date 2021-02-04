import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function JeSuisPassagerAfficherUnCovoiturage(){

    const [data, setaData] = useState([]);
    const [vientDe] = useState("au");
    const { id, jour, aller_ou_retour } = useParams();

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/mesCovoiturages/afficher-un/je-suis-passager/" + id +"/" + jour + "/" + aller_ou_retour,
                { headers: { "x-auth-token": token } },
            )
            setaData(result);
        }
        fetchData();
    }, [id, jour, aller_ou_retour, token]);

    return(
        <div style={{marginTop: "80px"}}>
            {data.length === 0 ? (
                <h3 style={{marginTop: "50%", textAlign: "center"}}>
                    Chargement...
                </h3>
            ) : (
                <div>
                    <div className="container col-6">
                        <table className="table affichage-profil">
                            <thead>
                                <tr>
                                    <th style={{textAlign: 'center'}}>Trajet {data.data.aller_ou_retour} de <Link style={{color: "whitesmoke"}} to={"LIEN-VERS-PROFIL-PARTIEL/" + data.data.conducteur._id}>{data.data.conducteur.prenom}</Link></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {aller_ou_retour === 'aller' &&
                                        <td>
                                            <h5>Part le {data.data.trajet_aller.jour.toLowerCase()} de {data.data.trajet_aller.depart}{data.data.trajet_aller.depart_quartier && <span>, {data.data.trajet_aller.depart_quartier}</span>} à {data.data.trajet_aller.heure_de_depart_en_string} pour {data.data.trajet_aller.destination}{data.data.trajet_aller.destination_quartier && <span>, {data.data.trajet_aller.destination_quartier}</span>}</h5>
                                            <h5>Places disponibles: {data.data.trajet_aller.nombre_de_places}/{data.data.trajet_aller.nombre_de_places_total}</h5>
                                            {data.data.passagers.map(passager => (
                                                <div key={passager._id}>
                                                    {passager._id === id &&
                                                        <h5>Passager: Moi</h5>
                                                    }
                                                    {passager._id !== id &&
                                                        <h5>Passager: <Link to={"LIEN-VERS-PROFIL-PARTIEL/" + passager._id}></Link>{passager.prenom}</h5>
                                                    }
                                                </div>
                                            ))}
                                        </td>
                                    }
                                    {aller_ou_retour === 'retour' &&
                                        <td>
                                            <h5>Part le {data.data.trajet_retour.jour.toLowerCase()} de {data.data.trajet_retour.depart}{data.data.trajet_retour.depart_quartier && <span>, {data.data.trajet_retour.depart_quartier}</span>} à {data.data.trajet_retour.heure_de_depart_en_string} pour {data.data.trajet_retour.destination}{data.data.trajet_retour.destination_quartier && <span>, {data.data.trajet_retour.destination_quartier}</span>}</h5>
                                            <h5>Places disponibles: {data.data.trajet_retour.nombre_de_places}/{data.data.trajet_retour.nombre_de_places_total}</h5>
                                            {data.data.passagers.map(passager => (
                                                <div key={passager._id}>
                                                    {passager._id === id &&
                                                        <h5>Passager: Moi</h5>
                                                    }
                                                    {passager._id !== id &&
                                                        <h5>Passager: <Link to={"LIEN-VERS-PROFIL-PARTIEL/" + passager._id}>{passager.prenom}</Link></h5>
                                                    }
                                                </div>
                                            ))}
                                        </td>
                                    }
                                </tr>
                                <tr>
                                    <td><h5 style={{textAlign: "center"}}><Link to={"/mesCovoiturage/quitter-un/" + id + "/" + data.data._id + "/" + jour + "/" + aller_ou_retour}>Quitter ce trajet</Link></h5></td>
                                </tr>
                                <tr>
                                    <td><h5 style={{textAlign: "center"}}><Link to={"/tous-mes-covoiturage-avec-un-conducteur/" + id + "/" + data.data.conducteur._id + "/" + data.data.conducteur.prenom + "/" + vientDe}>Quitter plusieurs trajets de {data.data.conducteur.prenom}</Link></h5></td>
                                </tr>
                            </tbody>
                        </table>
                        <h5 style={{textAlign: "center"}}><Link to={"/membre/" + id}>Retour</Link></h5>
                    </div>
                </div>
            )
            }
        </div>
    )
}