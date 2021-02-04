import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function SupprimerFAQ(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();

    const { faqId, from } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/FAQ/afficher-une/" + faqId,
                { headers: { "x-auth-token": token } },
            )
            if(result.data === null)
            {
                history.push("/admin/faq/afficher/sujet/" + faqId);
            }
            setData(result.data);
        }
        fetchData();
    }, [faqId, token, history])

    const supprimer = async function(){

        try{
            await Requete.delete(
                "/FAQ/supprimer/" + faqId,
                { headers: { "x-auth-token": token } }, // Doit être en dernier pour éviter tout problème de token lors de la validation
            )
            history.push("/admin/faq/gerer");

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div>
        {data.length === 0 ? (
            <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement...</h3>
        ) : (
            <div className="container" style={{marginTop: "80px"}}>
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                <h4>Souhaitez-vous supprimer cette FAQ ? Tous les paragraphes de cette FAQ seront aussi supprimés </h4>
                <h4>{data.sujet}</h4>
                <button onClick={() => supprimer()} className="btn btn-danger">Supprimer</button>
                <br></br>
                <br></br>
                {from === "depuis ajout" &&
                    <h4 style={{textAlign: "center"}}><Link to={"/admin/faq/ajouter/paragraphe/" + faqId}>Retour</Link></h4>
                }
                {from === "depuis afficher" &&
                    <h4 style={{textAlign: "center"}}><Link to={"/admin/faq/afficher-une/" + faqId}>Retour</Link></h4>
                }
            </div>
        )}
        </div>
    )

}