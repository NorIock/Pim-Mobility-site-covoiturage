import React , { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function MatchingAller(){

    const [data, setData] = useState([]);
    const [noData, setNoData] = useState(false);
    const [jourTrajetsAffichage, setJourTrajetsAffichage] = useState([]);

    const history = useHistory();
    const { id } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        
        async function fetchData(){
            const result = await Requete.get(
                "/matching/trouver/aller/" + id,
                { headers: { "x-auth-token": token } }
            );
            if(result.data.length === 0){ // Affiche un message s'il n'y a pas de résultats
                setNoData(true);
            } else {
                setNoData(false);
            }
            setData(result);
        }
        fetchData();

        async function jourTrajetData(){
            const resultJoursTrajets = await Requete.get(
                "/trajetsAller/afficher-pour-matching/" + id,
                { headers: { "x-auth-token": token } }
            );
            setJourTrajetsAffichage(resultJoursTrajets);
        }
        jourTrajetData();
    }, [id, token]);

    return(
        <div>
            {data.length === 0 || jourTrajetsAffichage.length === 0 ? (
                <h3 style={{marginTop: "80px", textAlign: "center"}}>Chargement...</h3> ) : (
                <div className="container">
                {noData === true &&  // S'il n'y a pas de résultats'
                    <div className="card">
                        <h3 style={{textAlign: "center"}}>Pas de résultats correspondant à vos critères de recherche ou vous avez déjà un covoiturage pour tous vos trajets</h3>
                        <h3 style={{textAlign: "center"}}>N'hésitez pas à revenir régulièrement, les trajets de nouveaux membres pourraient coïncider les vôtres</h3>
                    </div>
                }
                {noData === false &&
                    <div>
                    <h3 style={{marginTop: "80px", marginBottom: "30px", textAlign: "center"}}>Trajets aller correspondant à vos critères:</h3>
                        {jourTrajetsAffichage.data.map(jourTrajet => (
                            <div key={jourTrajet.jour.toString()} className="div-affichage-matching">
                            <table className="table affichage-matching">
                                <thead>
                                    <tr>
                                        <th style={{textAlign: "center"}}><h3>{jourTrajet.jour}</h3></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map(trajetsAller => (
                                        <tr key={trajetsAller._id} className="hover-ponctuel" onClick={()=>history.push("/matching/aller/profil/" + trajetsAller.membre_id + "/" + id)}>
                                            {jourTrajet.jour === trajetsAller.jour &&
                                            <td>
                                                <h5>Trajet effectué par <strong>{trajetsAller.prenom}</strong> le {trajetsAller.jour.toLowerCase()} à <strong>{trajetsAller.heure_de_depart_en_string}</strong> de <strong>{trajetsAller.depart}{trajetsAller.depart_quartier && <span>, {trajetsAller.depart_quartier}</span>}</strong> pour <strong>{trajetsAller.destination}{trajetsAller.destination_quartier && <span>, {trajetsAller.destination_quartier}</span>}</strong></h5>
                                                {trajetsAller.nombre_de_places &&
                                                    <h5>Places disponibles: <strong>{trajetsAller.nombre_de_places}</strong></h5>
                                                }
                                            </td>
                                            }
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        ))}
                    </div>
                }
                </div>
            )}
        </div>
    )
}