import React, {useState, useEffect} from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../../../../middlewares/Requete';

export default function AfficherDetailTrajetsAllerDepart(){

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
                "/trajetsAller/depart/tous/" + nom,
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
                    <h3>Aucuns trajets aller au départ de {nom}</h3>
                    <br></br>
                    <h4 style={{textAlign: "center"}}><Link to={"/admin/statistiques"}>retour</Link></h4>
                </div>
                :
                <div className="container" style={{marginTop: "80px"}}>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{ textAlign: "center"}}><h5>Trajets aller au départ de {nom}: {data.length}</h5></th>
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