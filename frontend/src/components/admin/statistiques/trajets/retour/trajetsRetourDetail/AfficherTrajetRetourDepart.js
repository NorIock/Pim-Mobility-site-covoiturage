import React, {useState, useEffect} from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../../../../middlewares/Requete';

export default function AfficherDetailTrajetsRetourDepart(){

    const [data, setData] = useState([]);
    const history = useHistory();
    const { nom } = useParams();
    

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }
    
    useEffect(()=>{

        async function fetchData(){
            const result = await Requete.get(
                "/trajetsretour/depart/tous/" + nom,
                { headers: { "x-auth-token": token } }
            );
            setData(result.data);
        };
        fetchData();
    }, [token, nom]);

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{marginTop: "80px", textAlign: "center"}}>Chargement...</h3>
            ) : (
                data === "Queud" ?
                <div className="container" style={{ border: "3px solid #317681", textAlign: "center", marginTop: "80px"}}>
                    <h3>Aucuns trajets retour au départ de {nom}</h3>
                    <br></br>
                    <h4 style={{textAlign: "center"}}><Link to={"/admin/statistiques"}>retour</Link></h4>
                </div>
                :
                <div className="container" style={{marginTop: "80px"}}>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{ textAlign: "center"}}><h5>Trajets retour au départ de {nom}: {data.length}</h5></th>
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