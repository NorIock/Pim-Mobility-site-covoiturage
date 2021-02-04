import React , { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function MatchingRetour(){

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
                "/matching/trouver/retour/" + id,
                { headers: { "x-auth-token": token } }
            );
            if(result.data.length === 0){
                setNoData(true);
            } else {
                setNoData(false);
            }
            setData(result);
        }
        fetchData();

        async function jourTrajetData(){
            const resultJoursTrajets = await Requete.get(
                "/trajetsRetour/afficher-pour-matching/" + id,
                { headers: { "x-auth-token": token } }
            );
            setJourTrajetsAffichage(resultJoursTrajets);
        }
        jourTrajetData();
    }, [id, token]);

    return(
        <div>
            {data.length === 0 || jourTrajetsAffichage.length === 0 ? (
                <p>Chargement...</p> ) : (
                <div className="container">
                    {noData === true &&  // S'il n'y a pas de résultats'
                        <div className="card">
                            <h3 style={{textAlign: "center"}}>Pas de résultats correspondant à vos critères de recherche ou vous avez déjà un covoiturage pour tous vos trajets</h3>
                            <h3 style={{textAlign: "center"}}>N'hésitez pas à revenir régulièrement, les trajets de nouveaux membres pourraient coïncider les vôtres</h3>
                        </div>
                    }
                    {noData === false &&
                        <div>
                        <h3 style={{marginTop: "80px", marginBottom: "30px", textAlign: "center"}}>Trajets retour correspondant à vos critères:</h3>
                            {jourTrajetsAffichage.data.map(jourTrajet => (
                                <div key={jourTrajet.jour.toString()} className="div-affichage-matching">
                                <table className="table affichage-matching">
                                    <thead>
                                        <tr>
                                            <th style={{textAlign: "center"}}><h3>{jourTrajet.jour}</h3></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.data.map(trajetsRetour => (
                                            <tr key={trajetsRetour._id} className="hover-ponctuel" onClick={()=>history.push("/matching/retour/profil/" + trajetsRetour.membre_id + "/" + id)}>
                                                {jourTrajet.jour === trajetsRetour.jour &&
                                                <td>
                                                    <h5>Trajet effectué par <strong>{trajetsRetour.prenom}</strong> le {trajetsRetour.jour.toLowerCase()} à <strong>{trajetsRetour.heure_de_depart_en_string}</strong> de <strong>{trajetsRetour.depart}{trajetsRetour.depart_quartier && <span>, {trajetsRetour.depart_quartier}</span>}</strong> pour <strong>{trajetsRetour.destination}{trajetsRetour.destination_quartier && <span>, {trajetsRetour.destination_quartier}</span>}</strong></h5>
                                                    {trajetsRetour.nombre_de_places &&
                                                        <h5>Places disponibles: <strong>{trajetsRetour.nombre_de_places}</strong></h5>
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