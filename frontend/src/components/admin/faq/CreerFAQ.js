import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';
import AdminAfficherToutesFAQ from './AfficherToutes';

export default function AdminCreerSujetFAQ(){

    const [error, setError] = useState();
    const [sujet, setSujet] = useState();

    const history = useHistory();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    const onSubmit = async function(e){
        e.preventDefault();

        try{
            const nouveauSujet = { sujet };

            const sujetRes =  await Requete.post(
                "/FAQ/creerSujet",
                nouveauSujet,
                { headers: { "x-auth-token": token } },
            );
            history.push("/admin/faq/ajouter/paragraphe/" + sujetRes.data._id);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div>
            <div className="card container" style={{marginTop: "80px"}}>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Nouveau sujet pour la FAQ</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Ecrire le nouveau sujet"
                            onChange={(e)=>setSujet(e.target.value)}
                        />
                    </div>
                    {error && (
                        <div>
                        <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                        <br></br>
                        </div>
                    )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                    <div className="form-group">
                        <input type="submit" className="btn btn-primary float-right" value="Créer le nouveau sujet" />
                    </div>
                </form>
                <br></br>
                <h4 style={{textAlign: "center"}}><Link to={"/"}>Retour</Link></h4>
            </div>
            <AdminAfficherToutesFAQ />
        </div>
    )
}