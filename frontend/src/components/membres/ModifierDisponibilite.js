import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';

import Requete from '../../middlewares/Requete';

export default function ModifierDisponibilite(){

    const [data, setData] = useState([]);
    const [indisponible, setIndisponible] = useState();

    const { id } = useParams();
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
                '/membres/afficher-un/' + id,
                { headers: { "x-auth-token": token } },
            );
            setData(result.data);
            setIndisponible(result.data.indisponible);
        }
        fetchData();
    }, [id, token]);

    const submit = async function(){
        
        let nouvelleIndisponibilite;
        if(!indisponible){
            nouvelleIndisponibilite = true;
        }

        if(indisponible){
            nouvelleIndisponibilite = false;
        }

        const modifierDisponibiliteCovoiturage = { nouvelleIndisponibilite };
        await Requete.post(
            "/membres/indisponible/" + id,
            modifierDisponibiliteCovoiturage,
            { headers: { "x-auth-token": token } }
        )
        history.push("/membre/" + id);

    }

    return(
        <div className="container" style={{marginTop: "80px"}}>
            {data.length === 0 || indisponible === undefined ? (
                <h3 style={{ textAlign: "center", marginTop: "50px"}}>Chargement...</h3>
            ): (
                <div>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>Modifier ma disponibilité pour du covoiturage</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {data.indisponible === false &&
                                    <td>
                                        <h4>Vous êtes disponible pour du covoiturage, vous apparaissez lors des recherches de covoiturage planifiées</h4>
                                        <input
                                            type='submit'
                                            value='Devenir indisponible'
                                            className='btn btn-primary float-right'
                                            onClick={submit}
                                        />
                                    </td>
                                }
                                {data.indisponible === true &&
                                    <td>
                                        <h4>Vous n'êtes pas disponible pour du covoiturage, vous n'apparaissez pas lors des recherches de covoiturage planifiées</h4>
                                        <input
                                            type='submit'
                                            value='Devenir disponible'
                                            className='btn btn-primary float-right'
                                            onClick={submit}
                                        />
                                    </td>
                                }
                            </tr>
                        </tbody>
                    </table>
                    <h3 style={{ textAlign: "center"}}><Link to={"/membre/" + id}>Retour</Link></h3>
                </div>
            )}
        </div>
    )
}