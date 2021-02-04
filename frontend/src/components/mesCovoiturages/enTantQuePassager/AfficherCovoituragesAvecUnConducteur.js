import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete'
import CheckBox from '../../../middlewares/CheckBox';
import ErrorNotice from '../../misc/ErrorNotice';

export default function JeSuisPassagerAfficherTousMesCovoituragesAvecUnConducteur(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();
    const [checkItems, setCheckItems] = useState({}); // CheckBox

    const history = useHistory();
    const { passagerId, conducteurId, prenom, vientDe } = useParams();

    const HandleChange = (e) => {
        setCheckItems({
            ...checkItems,
            [e.target.name]: e.target.checked
        });
    }
    
    let token = localStorage.getItem("auth-token")
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/mesCovoiturages/passager/un-conducteur/" + passagerId + "/" + conducteurId,
                { headers: {"x-auth-token": token } },
            )
            setData(result);
        }
        fetchData();
    }, [token, conducteurId, passagerId]);

    const submit = async function(e){
        e.preventDefault(e);

        try{
            const sortirPassager = { checkItems };
    
            await Requete.post(
                "/mesCovoiturages/passager/quitter-un-conducteur/" + passagerId + "/" + conducteurId,
                sortirPassager,
                { headers: { "x-auth-token": token } }
            );
            history.push("/mesCovoiturages/" + passagerId);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        };
    };

    return(
        <div style={{marginTop: "80px"}}>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center", marginTop: "100px"}}>Chargement...</h3>
            ) : (
                <div className="container">
                    <form onSubmit={submit}>
                        <table className="table affichage-profil">
                            <thead>
                                <tr>
                                    <th style={{width: "10px", textAlign: "center"}}>Choisir</th>
                                    <th>le (les) Covoiturage(s) avec {prenom} que vous souhaitez arrêter</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map(equipage => (
                                    <tr key={equipage._id}>
                                        <td>
                                            <label style={{textAlign:"center"}}>
                                                <CheckBox
                                                    name={equipage._id}
                                                    checked={checkItems[equipage._id]}
                                                    onChange={HandleChange}
                                                    />
                                            </label>
                                        </td>
                                        {equipage.aller_ou_retour === "aller" &&
                                            <td>
                                                <h4>Trajet {equipage.aller_ou_retour}</h4>
                                                <h4>Départ le {equipage.trajet_aller.jour.toLowerCase()} de {equipage.trajet_aller.depart}{equipage.trajet_aller.depart_quartier && <span>, {equipage.trajet_aller.depart_quartier}</span>} pour {equipage.trajet_aller.destination}{equipage.trajet_aller.destination_quartier && <span>, {equipage.trajet_aller.destination_quartier}</span>} à {equipage.trajet_aller.heure_de_depart_en_string}</h4>
                                            </td>
                                        }
                                        {equipage.aller_ou_retour === "retour" &&
                                            <td>
                                            <h4>Trajet {equipage.aller_ou_retour}</h4>
                                            <h4>Départ le {equipage.trajet_retour.jour.toLowerCase()} de {equipage.trajet_retour.depart}{equipage.trajet_retour.depart_quartier && <span>, {equipage.trajet_retour.depart_quartier}</span>} pour {equipage.trajet_retour.destination}{equipage.trajet_retour.destination_quartier && <span>, {equipage.trajet_retour.destination_quartier}</span>} à {equipage.trajet_retour.heure_de_depart_en_string}</h4>
                                        </td>
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {error && (
                            <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                        )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                        <div className='form-group'>
                            <input type='submit' value='Arrêter le (les) covoiturage(s) selectionné(s)' className='btn btn-primary float-right'/>
                            {vientDe === "pc" &&
                                <Link to={"/mesCovoiturages/passager/profil-partiel/" + conducteurId + "/" + passagerId}>Page précédente</Link>
                            }
                            {vientDe === "au" &&
                                <Link to={"/membre/" + passagerId}>Retour</Link>
                            }
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}