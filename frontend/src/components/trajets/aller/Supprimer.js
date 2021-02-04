import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';
import CheckBox from '../../../middlewares/CheckBox';

export default function SupprimerUnOuPlusieursTrajetsAller(){

    const [data, setData] = useState([]);
    const [noData, setNoData] = useState(false);
    const [error, setError] = useState();
    const [checkItems, setCheckItems] = useState({}); // CheckBox

    const history = useHistory();
    const { id } = useParams();

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
                "/trajetsAller/afficher/" + id,
                { headers: { "x-auth-token": token } },
            )
            if(result.data.length === 0){ // Affiche un message s'il n'y a pas de résultats
                setNoData(true);
            } else {
                setNoData(false);
            }
            setData(result.data);
        }
        fetchData();
    }, [id, token])

    const submit = async function(e){
        e.preventDefault(e);

        try{
            const supprimerTrajet = { checkItems };
            
            await Requete.post(
                "/trajetsAller/supprimer/" + id,
                supprimerTrajet,
                { headers: { "x-auth-token": token } }
            );
            history.push("/membre/" + id);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div style={{marginTop: "80px"}}>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center"}}>Chargement....</h3>
            ) : (
                noData === true ? (
                    history.push("/membre/" + id)
                ) : (
                    <div className="container">
                        <form onSubmit={submit}>
                            <table className="table affichage-profil">
                                <thead>
                                    <tr>
                                        <th style={{width: "10px", textAlign: "center"}}>Choisir</th>
                                        <th> le (les) trajet(s) que vous souhaitez supprimer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(trajetsAller => (
                                        <tr key={trajetsAller._id}>
                                            <td>
                                                <label style={{textAlign:"center"}}>
                                                    <CheckBox
                                                        name={trajetsAller._id}
                                                        checked={checkItems[trajetsAller._id]}
                                                        onChange={HandleChange}
                                                        />
                                                </label>
                                            </td>
                                            <td>
                                                <h4>{trajetsAller.jour} à {trajetsAller.heure_de_depart_en_string}</h4>
                                                <h4>Part de {trajetsAller.depart}{trajetsAller.depart_quartier && <span>, {trajetsAller.depart_quartier}</span>} pour {trajetsAller.destination}{trajetsAller.destination_quartier && <span>, {trajetsAller.destination_quartier}</span>}</h4>
                                                {trajetsAller.nombre_de_places &&
                                                    <h4>Places disponibles: {trajetsAller.nombre_de_places}/{trajetsAller.nombre_de_places_total}</h4>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {error && (
                                <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                            )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                            <p></p>
                            <div className='form-group'>
                                <input type='submit' value='Supprimer le (les) trajet(s) selectionné(s)' className='btn btn-primary float-right'/>
                                <Link to={"/membre/" + id}>Page précédente</Link>
                            </div>
                        </form>
                    </div>
                )
            )}
        </div>
    )
}