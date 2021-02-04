import React, { useState, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function ModifierQuartier(){

    const [nomQuartier, setNomQuartier] = useState();
    const [data, setData] = useState([]);
    const [error, setError] = useState();

    const history = useHistory();
    const { quartierId, departOuDestination, zoneId } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(function(){
        async function fetchData(){
            const result = await Requete.get(
                "/quartier/afficher-un/" + quartierId,
            );
            setData(result.data);
        };
        fetchData();
    }, [quartierId]);

    const submit = async function(e){
        e.preventDefault();

        try{
            const modifierNomQuartier = { nomQuartier };

            await Requete.put(
                "/quartier/modifier/" + quartierId,
                modifierNomQuartier,
                { headers: { "x-auth-token": token } }
            );
            history.push("/admin/quartier/ajouter/" + departOuDestination + "/" + zoneId);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    };

    return(
        <div className="container" style={{marginTop: "80px"}}>
            <form onSubmit={submit}>
                <div className="form-group">
                    <label>Quel est le nouveau non du quartier:</label>
                    <input
                        type='text'
                        placeholder='Indiquez le nouveau nom'
                        className='form-control'
                        defaultValue={data.nom_quartier}
                        onChange={(e)=>setNomQuartier(e.target.value)}
                    />
                </div>
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <div className='form-group'>
                    <input
                        type='submit'
                        className='btn btn-primary'
                        value='Modifier'
                    />
                </div>
                <Link to={"/admin/quartier/ajouter/" + departOuDestination + "/" + zoneId}>Retour</Link>
                <div>
                    <button className="btn btn-danger" onClick={()=>history.push("/admin/quartier/supprimer/" + quartierId + "/" + departOuDestination + "/" + zoneId)}
                    >Supprimer le quartier</button>
                </div>
                </div>
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
            </form>
        </div>
    )
}