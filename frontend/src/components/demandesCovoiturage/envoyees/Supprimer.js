import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import CheckBox from '../../../middlewares/CheckBox';
import ErrorNotice from '../../misc/ErrorNotice';

export default function SupprimerDemandeCovoiturage(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();
    const [checkItems, setCheckItems] = useState({});
    const history = useHistory();

    const { id } = useParams(); // id est l'_id du membre à supprimer

    let token = localStorage.getItem("auth-token")
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    const HandleChange = (e) => {
        setCheckItems({
            ...checkItems,
            [e.target.name]: e.target.checked
        });
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/covoiturageDemande/afficher/envoyees/" + id,
                { headers: {"x-auth-token": token } },
            )
            setData(result);
        }
        fetchData();
    }, [id, token]);

    const submit = async function(e){
        e.preventDefault();

        try{
            const supprimerDemandes = { checkItems };

            // On utilise un .post (dans le front et le back) au lieu d'un point delete car comme on envoie du contenu via les checkboxs,
            // avec le .delete j'ai une erreur de token undefined
            await Requete.post(
                "/covoiturageDemande/supprimer/" + id,
                supprimerDemandes,
                { headers: { "x-auth-token": token } }
            );
            history.push("/demandesCovoiturages/envoyees/en-cours/" + id);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div>
            {data.length === 0 ? (
                <div>chargement...</div>
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    <form onSubmit={submit}>
                        <table className="table demandes-covoiturages-recues">
                            <thead>
                                <tr>
                                    <th style={{width:"10px", verticalAlign: "middle"}}>Choisir</th>
                                    <th style={{textAlign: "center"}}>
                                        <h5>Sélectionnez la ou les demande(s) que vous souhaitez supprimer</h5>
                                        <h5 style={{color: "#ff3333"}}>ATTENTION: toute suppression est définitive</h5>
                                    </th>
                                </tr>
                            </thead>
                            {data.data.map(demandes_covoiturage => (
                            <tbody key={demandes_covoiturage._id}>
                                {demandes_covoiturage.trajets_aller.map(demandeAller => (
                                    <tr key={demandeAller}>
                                        <td>
                                            <label style={{textAlign:"center"}}>
                                                <CheckBox
                                                    name={demandes_covoiturage._id}
                                                    checked={checkItems[demandes_covoiturage._id]}
                                                    onChange={HandleChange}
                                                />
                                            </label>
                                        </td>
                                        <td>
                                            <h5>Pour un trajet {demandes_covoiturage.aller_ou_retour} à <strong>{demandeAller.prenom}</strong> le <strong>{demandeAller.jour.toLowerCase()}</strong> de {demandeAller.depart} à {demandeAller.heure_de_depart_en_string} pour {demandeAller.destination}</h5> 
                                        </td>
                                    </tr>
                                ))}
                                {demandes_covoiturage.trajets_retour.map(demandeRetour => (
                                    <tr key={demandeRetour._id}>
                                        <td>
                                            <label style={{textAlign:"center"}}>
                                                <CheckBox
                                                    name={demandes_covoiturage._id}
                                                    checked={checkItems[demandes_covoiturage._id]}
                                                    onChange={HandleChange}
                                                />
                                            </label>
                                        </td>
                                        <td>
                                        <h5>Pour un trajet {demandes_covoiturage.aller_ou_retour} à <strong>{demandeRetour.prenom}</strong> le <strong>{demandeRetour.jour.toLowerCase()}</strong> de {demandeRetour.depart} à {demandeRetour.heure_de_depart_en_string} pour {demandeRetour.destination}</h5> 
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        ))}
                    </table>
                    <div style={{paddingLeft:"1%", paddingRight:"1%", paddingBottom:"1%", borderLeft: "3px solid #317681", borderRight: "3px solid #317681"}}>
                        {error && (
                            <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                        )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                    </div>
                    <div className="demandes-covoiturages-recues-boutons">
                        <input
                            type='submit'
                            value='Supprimer les demandes cochées'
                            className='btn btn-primary'
                            onClick={submit}
                        />
                        <p></p>
                    </div>
                    <br></br>
                    <h5 style={{textAlign:"center"}}><Link to={"/demandesCovoiturages/envoyees/en-cours/" + id}>Retour à la liste des demandes</Link></h5>
                </form>
            </div>
            )
            }
        </div>
    )
}