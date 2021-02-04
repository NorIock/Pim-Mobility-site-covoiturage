import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import Requete from "../../middlewares/Requete";

export default function MesCovoiturages(){

    const [data, setData] = useState([]);
    const [noData, setNodata] = useState(false);

    const { id } = useParams();

    let token = localStorage.getItem("auth-token")
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/mesCovoiturages/afficher/" + id,
                { headers: { "x-auth-token": token } },
            )
            if(result.data.length === 0){
                setNodata(true);
            }
            setData(result);
        }
        fetchData();
    }, [id, token]);

    return(
        <div>
            {data.length === 0 ? (
            <h3 style={{marginTop: "80px", textAlign:"center"}}>Chargement...</h3>
            ) : (
                <div>
                    {noData === true &&
                    <div className="container" style={{marginTop: "80px"}}>
                        <h3 style={{textAlign: "center"}}>Vous n'avez pas encore trouvé de covoiturage</h3>
                    </div>
                    }
                    {noData === false &&
                    <div className="container" style={{marginTop: "80px"}}>
                        <div className="row">
                            <div className=" col-sm-12 col-md-12 col-lg-6 col-xl-6">
                                <table className="table affichage-profil">
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: "center" }}>Trajets aller</th>
                                        </tr>
                                    </thead>
                                    {data.data.map(equipage => (
                                    <tbody key={equipage._id}>
                                        {(equipage.trajet_aller && equipage.passagers.length > 0) &&
                                        <tr>    
                                            <td>
                                                <div>
                                                <h5>{equipage.trajet_aller.jour} à {equipage.trajet_aller.heure_de_depart_en_string}</h5>
                                                <h5>Départ: {equipage.trajet_aller.depart}{equipage.trajet_aller.depart_quartier && <span>, {equipage.trajet_aller.depart_quartier}</span>} pour {equipage.trajet_aller.destination}{equipage.trajet_aller.destination_quartier && <span>, {equipage.trajet_aller.destination_quartier}</span>}</h5>
                                                <h5>Places disponibles: {equipage.trajet_aller.nombre_de_places}/{equipage.trajet_aller.nombre_de_places_total}</h5>
                                                {equipage.conducteur._id === id &&
                                                <h5>Conducteur: Je suis le conducteur</h5>
                                                }
                                                {equipage.conducteur._id !== id &&
                                                <h5>Conducteur: <Link to={"/mesCovoiturages/conducteur/profil-partiel/" + equipage.conducteur._id + "/" + id}>{equipage.conducteur.prenom}</Link></h5>
                                                }
                                                {equipage.passagers.map(passager => (
                                                    <div key={passager._id}>
                                                        {passager._id === id &&
                                                        <h5>Passager: Moi</h5>
                                                        }
                                                        {(passager._id !== id && equipage.conducteur._id === id) &&
                                                        <h5>Passager: <Link to={"/mesCovoiturages/passager/profil-partiel/" + passager._id + "/" + id}>{passager.prenom}</Link></h5>
                                                        }
                                                        {(passager._id !== id && equipage.conducteur._id !== id) &&
                                                        <h5>Passager: {passager.prenom}</h5>
                                                        }
                                                    </div>
                                                ))}
                                                </div>
                                            </td>
                                        </tr>
                                        }
                                    </tbody>
                                    ))}
                                </table>
                            </div>
                            <div className=" col-sm-12 col-md-12 col-lg-6 col-xl-6">
                                <table className="table affichage-profil">
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: "center" }}>Trajets retours</th>
                                        </tr>
                                    </thead>
                                    {data.data.map(equipage => (
                                    <tbody key={equipage._id}>
                                        {(equipage.trajet_retour && equipage.passagers.length > 0) &&
                                        <tr>
                                            <td>
                                                <div>
                                                <h5>{equipage.trajet_retour.jour} à {equipage.trajet_retour.heure_de_depart_en_string}</h5>
                                                <h5>Départ: {equipage.trajet_retour.depart}{equipage.trajet_retour.depart_quartier && <span>, {equipage.trajet_retour.depart_quartier}</span>} pour: {equipage.trajet_retour.destination}{equipage.trajet_retour.destination_quartier && <span>, {equipage.trajet_retour.destination_quartier}</span>}</h5>
                                                <h5>Places disponibles: {equipage.trajet_retour.nombre_de_places}/{equipage.trajet_retour.nombre_de_places_total}</h5>
                                                {equipage.conducteur._id === id &&
                                                <h5>Conducteur: Je suis le conducteur</h5>
                                                }
                                                {equipage.conducteur._id !== id &&
                                                <h5>Conducteur: <Link to={"/mesCovoiturages/conducteur/profil-partiel/" + equipage.conducteur._id + "/" + id}>{equipage.conducteur.prenom}</Link></h5>
                                                }
                                                {equipage.passagers.map(passager => (
                                                    <div key={passager._id}>
                                                        {passager._id === id &&
                                                        <h5>Passager: Moi</h5>
                                                        }
                                                        {(passager._id !== id && equipage.conducteur._id === id) &&
                                                        <h5>Passager: <Link to={"/mesCovoiturages/passager/profil-partiel/" + passager._id + "/" + id}>{passager.prenom}</Link></h5>
                                                        }
                                                        {(passager._id !== id && equipage.conducteur._id !== id) &&
                                                        <h5>Passager: {passager.prenom}</h5>
                                                        }
                                                    </div>
                                                ))}
                                                </div>
                                            </td>
                                        </tr>
                                        }
                                    </tbody>
                                    ))}
                                </table>
                            </div>
                        </div>  
                    </div>
                    }
                </div>
            )
            }
        </div>
    )
}