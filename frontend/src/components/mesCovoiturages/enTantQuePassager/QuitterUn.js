import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function JeSuisPassagerQuitterUnCovoiturage(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();
    const { membreId, equipageId, jour, aller_ou_retour } = useParams();
    const history = useHistory();

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/mesCovoiturages/afficher-un/" + equipageId,
                { headers: { "x-auth-token": token } },
            )
            setData(result);
        }
        fetchData();
    }, [equipageId, token]);

    const quitter = async function(){
        try{
            await Requete.delete(
                "/mesCovoiturages/quitter-un/" + equipageId + "/" + membreId,
                { headers: { "x-auth-token": token } },
            )
            history.push("/membre/" + membreId);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div style={{marginTop: "80px"}}>
            {data === null ? (
                history.push("/membre/" + membreId)
            ) : (
                data.length === 0 ? (
                <div style={{marginTop: "50%", textAlign: "center"}}>
                    <h3>Chargement...</h3>
                </div>
                ) : (
                    <div className="container col-6">
                        <table className="table quitter-ou-supprimer">
                            <thead>
                                <tr>
                                    <th style={{textAlign: "center"}}><h3>Voulez-vous quitter ce trajet de {data.data.conducteur.prenom}</h3></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {data.data.aller_ou_retour === 'aller' &&
                                        <td>
                                            <h5>Le {data.data.trajet_aller.jour.toLowerCase()} de {data.data.trajet_aller.depart}{data.data.trajet_aller.depart_quartier && <span>, {data.data.trajet_aller.depart_quartier}</span>} à {data.data.trajet_aller.heure_de_depart_en_string} pour {data.data.trajet_aller.destination}{data.data.trajet_aller.destination_quartier && <span>, {data.data.trajet_aller.destination_quartier}</span>}</h5>
                                        </td>
                                    }
                                    {data.data.aller_ou_retour === 'retour' &&
                                        <td>
                                            <h5>Le {data.data.trajet_retour.jour.toLowerCase()} de {data.data.trajet_retour.depart}{data.data.trajet_retour.depart_quartier && <span>, {data.data.trajet_retour.depart_quartier}</span>} à {data.data.trajet_retour.heure_de_depart_en_string} pour {data.data.trajet_retour.destination}{data.data.trajet_retour.destination_quartier && <span>, {data.data.trajet_retour.destination_quartier}</span>}</h5>
                                        </td>
                                    }
                                    
                                </tr>
                                <tr>
                                    <td>
                                        <button style={{marginRight: "10px"}} onClick={() => history.push("/monCovoiturage/afficher-un/" + membreId + "/" + jour + "/" + aller_ou_retour)} className="btn btn-primary float-left">Retour</button>
                                        <button style={{marginLeft: "10px"}} onClick={() => quitter()} className="btn btn-danger float-right">Quitter ce covoiturage</button>
                                        {error && (
                                            <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                                        )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    )
}