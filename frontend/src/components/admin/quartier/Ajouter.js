import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import AfficherQuartier from './Afficher';
import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function AjouterQuartier(){

    const [data, setData] = useState([]);
    const [nomQuartier, setNomQuartier] = useState();
    const [error, setError] = useState();
    // toChild sera modifiée à chaque fois que l'on clique sur submit (ligne 25) et envoyé au child component Afficher.js (ligne67)
    // Permet d'actualiser useEffect à chaque fois que l'on ajoute une donnée et pas en continu
    var [toChild, setToChild] = useState(0);
    const { departOuDestination, id} = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            if(departOuDestination === "depart"){
                const result = await Requete.get(
                    "/departs/afficher-un/" + id,
                )
                setData(result.data);
            }
            if(departOuDestination === "destination"){
                const result = await Requete.get(
                    "/destinations/afficher-une/" + id,
                )
                setData(result.data);
            }
        }
        fetchData();
    }, [id, departOuDestination])

    const submit = async function(e){
        e.preventDefault();

        try{
            const newQuartier = { nomQuartier };

            await Requete.post(
                "/quartier/ajouter/" + departOuDestination + "/" + id,
                newQuartier,
                { headers: { "x-auth-token": token } }
            );

            setToChild(toChild*1 + 1);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg);
        }
    };

    return(
        <div className="container" style={{marginTop: "80px"}}>
            <form onSubmit={submit}>
                <div className='form-group'>
                    <label><h3>Indiquer le nom du quartier à ajouter à {data.nom}</h3></label>
                    <input
                        className='form-control'
                        type='text'
                        placeholder="indiquez le nom du quartier"
                        onChange={(e)=>setNomQuartier(e.target.value)}
                    />
                </div>
                <div className='form-group'>
                    <input
                        type='submit'
                        className='btn btn-primary'
                        value='Ajouter'
                    />
                </div>
                {error && (
                <ErrorNotice message={error} clearError={()=> setError(undefined)} />
            )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
            </form>
            <div>
                <h5 style={{textAlign: "center"}}><Link to="/admin/quartier/gerer">Retour</Link></h5>
            </div>
            <div>
                <AfficherQuartier toChild={toChild} departOuDestination={departOuDestination} id={id}/>
            </div>
        </div>
    )
}