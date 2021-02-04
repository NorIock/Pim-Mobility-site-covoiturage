import React, {useState, useEffect} from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../../../../middlewares/Requete';

export default function AfficherDetailTousLesTrajetsAller(){

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
                "/trajetsAller/" + detail,
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
                                    <th style={{ textAlign: "center"}}><h5>Trajets aller: {data.length}</h5></th>
                                }
                                {detail === "sans-covoiturage" &&
                                    <th style={{ textAlign: "center"}}><h5>Trajets aller sans covoiturage: {data.length}</h5></th>
                                }
                                {detail === "conducteurs" &&
                                    <th style={{ textAlign: "center"}}><h5>Trajets aller avec un équipage: {data.length}</h5></th>
                                }
                                {detail === "passagers" &&
                                    <th style={{ textAlign: "center"}}><h5>Trajets aller avec covoiturage trouvé: {data.length}</h5></th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(aller => (
                                <tr className="hover-ponctuel" key={aller._id} onClick={()=>history.push("/membre/" + aller.membre_id)}>
                                    <td>
                                        <h5>{aller.jour} à {aller.heure_de_depart_en_string}, départ de {aller.depart} pour {aller.destination}</h5>
                                        {aller.conducteur_sur_ce_trajet === true &&
                                            <div>
                                            {aller.nombre_de_places_total - aller.nombre_de_places === 1 &&
                                                <h5>{aller.nombre_de_places_total - aller.nombre_de_places} passager trouvé</h5>
                                            }

                                            {aller.nombre_de_places_total - aller.nombre_de_places > 1 &&
                                                <h5>{aller.nombre_de_places_total - aller.nombre_de_places} passagers trouvés</h5>
                                            }
                                            </div>
                                        }
                                        {aller.passager_sur_autre_trajet === true &&
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