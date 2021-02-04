import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function SupprimerQuartier(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();

    const history = useHistory();
    const { quartierId, departOuDestination, zoneId } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }
    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/quartier/afficher-un/" + quartierId,
            );
            setData(result.data);
        };
        fetchData();
    }, [quartierId]);

    const supprimer = async function(){
        
        try{
            await Requete.delete(
                "/quartier/supprimer/" + quartierId + "/" + departOuDestination + "/" + zoneId,
                { headers: { "x-auth-token": token } }
            );
            history.push("/admin/quartier/ajouter/" + departOuDestination + "/" + zoneId)
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="container" style={{ marginTop: "80px" }}>
            {data === null ? (
                history.push("/admin/quartier/ajouter/" + departOuDestination + "/" + zoneId)
            ) : (

            <div>
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                <h4>Souhaitez-vous supprimer ce quartier: <strong>{data.nom_quartier}</strong> ?</h4>
                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                    <h5><Link to={"/admin/quartier/modifier/" + quartierId + "/" + departOuDestination + "/" + zoneId}>Retour</Link></h5>
                    <button 
                        onClick={() => supprimer()} 
                        className='btn btn-danger' 
                        >Supprimer</button>
                </div>
            </div>
            )}
        </div>
    )
}