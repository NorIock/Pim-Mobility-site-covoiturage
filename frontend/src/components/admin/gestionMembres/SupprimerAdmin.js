import React, { useState, useEffect } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';

import ErrorNotice from '../../misc/ErrorNotice';
import Requete from '../../../middlewares/Requete';

export default function SupprimerAdmin(){

    const [data, setData] = useState([]);
    const [motDePasse, setMotDePasse] = useState();
    const [error, setError] = useState();

    const history = useHistory();
    const { adminId } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token="";
    }

    // On récupère ce localStaorage utilisé pour les notifications afin d'être sûr que l'adminbistrateur ne supprime pas son propre profil
    let membreId = localStorage.getItem("id-pour-notifications");

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                "/membres/afficher-un/" + adminId,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        };
        fetchData();
    }, [adminId, token]);

    const supprimer = async function(e){
        e.preventDefault();

        try{
            const supprimerMembre = { motDePasse }
            await Requete.post(
                "/membres/admin/supprimer/" + adminId + "/" + membreId,
                supprimerMembre,
                { headers: { "x-auth-token": token } }, // Doit être en dernier pour éviter tout problème de token lors de la validation
            )
            history.push("/admin/admins/afficher-tous");
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        };
    };

    return(
        <div className="admin-display">
        {data.length === 0 ?
            <div className="container" style={{marginTop: "80px"}}>
                <h3>Chargement...</h3>
            </div>
        :
        data === null ? (
            history.push("/admin/admins/afficher-tous")
        ) : (
            <div className="container" style={{marginTop: "80px"}}>
                <form onSubmit={supprimer}>
                    <div className="form-group">
                        <label><h4>Taper le mot de passe pour supprimer <strong>{data.prenom} {data.nom}</strong></h4></label>
                        <input
                            type='password'
                            className='form-control'
                            placeholder='Mot de passe'
                            onChange={(e) => setMotDePasse(e.target.value)}
                        />
                    </div>
                    {error && (
                        <div>
                        <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                        <br></br>
                        </div>
                    )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                    <div className="form-group">
                        <input
                            type='submit'
                            value="Supprimer l'administrateur"
                            className="btn btn-primary" 
                        />
                    </div>
                    <h5 style={{textAlign: "center"}}><Link to={"/admin/admins/afficher-un/" + adminId}>retour</Link></h5>
                </form>
            </div>
        )}
        </div>
    )

}