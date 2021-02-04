import React, {useState, useEffect} from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../../../../middlewares/Requete';

export default function AfficherDetailTousLesTrajetsRetour(){

    const [data, setData] = useState([]);
    const history = useHistory();
    const { detail } = useParams();
    

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }
    
    useEffect(()=>{

        async function fetchData(){
            const result = await Requete.get(
                "/trajetsRetour/" + detail,
                { headers: { "x-auth-token": token } }
            );
            setData(result.data);
        };
        fetchData();
    }, [token, detail]);

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{marginTop: "80px", textAlign: "center"}}>Chargement...</h3>
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                {detail === "afficher-tous" &&
                                    <th style={{ textAlign: "center"}}><h5>Trajets retour: {data.length}</h5></th>
                                }
                                {detail === "sans-covoiturage" &&
                                    <th style={{ textAlign: "center"}}><h5>Trajets retour sans covoiturage: {data.length}</h5></th>
                                }
                                {detail === "conducteurs" &&
                                    <th style={{ textAlign: "center"}}><h5>Trajets retour avec un équipage: {data.length}</h5></th>
                                }
                                {detail === "passagers" &&
                                    <th style={{ textAlign: "center"}}><h5>Trajets retour avec covoiturage trouvé: {data.length}</h5></th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(retour => (
                                <tr className="hover-ponctuel" key={retour._id} onClick={()=>history.push("/membre/" + retour.membre_id)}>
                                    <td>
                                        <h5>{retour.jour} à {retour.heure_de_depart_en_string}, départ de {retour.depart} pour {retour.destination}</h5>
                                        {retour.conducteur_sur_ce_trajet === true &&
                                            <div>
                                            {retour.nombre_de_places_total - retour.nombre_de_places === 1 &&
                                                <h5>{retour.nombre_de_places_total - retour.nombre_de_places} passager trouvé</h5>
                                            }

                                            {retour.nombre_de_places_total - retour.nombre_de_places > 1 &&
                                                <h5>{retour.nombre_de_places_total - retour.nombre_de_places} passagers trouvés</h5>
                                            }
                                            </div>
                                        }
                                        {retour.passager_sur_autre_trajet === true &&
                                            <h5>Covoiturage trouvé</h5>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <h4 style={{textAlign: "center"}}><Link to={"/admin/statistiques"}>retour</Link></h4>
                </div>
            )}
        </div>
    )
}