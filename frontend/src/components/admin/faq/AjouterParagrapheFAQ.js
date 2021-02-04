import React, { useState, useEffect } from 'react';
import { useHistory, Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function AdminAjouterParagrapheFAQ(){

    const [data, setData] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const [paragraphe, setParagraphe] = useState();
    const [error, setError] = useState();
    const [from] = useState("depuis ajout");
    const history = useHistory();

    const { faqId } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/FAQ/afficher-une/" + faqId,
            )
            setData(result.data);
        }
        fetchData();
    }, [faqId, refresh])

    const onSubmit = async function(e){
        e.preventDefault();

        try{
            const nouveauParagraphe = { paragraphe };

            await Requete.post(
                "/FAQ/creerParagraphe/" + faqId,
                nouveauParagraphe,
                { headers: { "x-auth-token": token } },
            );
            setParagraphe();
            setRefresh(refresh*1 + 1);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement</h3>
            ) :(
            <div style={{marginTop: "80px"}} className="container">
                <table className="table affichage-profil">
                    <thead>
                        <tr>
                            <th style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                <span><h6 style={{cursor: "pointer"}} onClick={()=>history.push("/admin/faq/modifier/sujet/" + faqId + "/" + from)}>Modifier titre</h6></span>
                                <span><h4>{data.sujet}</h4></span>
                                <span><h6 style={{cursor: "pointer"}} onClick={()=>history.push("/admin/faq/supprimer/sujet/" + faqId + "/" + from)}>Supprimer</h6></span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.paragraphe.map(paragraphes =>(
                            <tr key={paragraphes._id}>
                                <td>
                                    <h5>{paragraphes.paragraphe}</h5>
                                    <br></br>
                                    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                        <h6><Link to={"/admin/paragraphe/modifier/" + paragraphes._id + "/" + from + "/" + faqId}>Modifier</Link></h6>
                                        <h6><Link to={"/admin/paragraphe/supprimer/" + paragraphes._id + "/" + from + "/" + faqId}>Supprimer</Link></h6>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="card" style={{marginTop: "20px"}}>
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label><h5 style={{color: "red"}}>Comme je n'arrivais pas la mise en forme des textes et pour que tout soit prêt à temps, il faut écrire les paragraphes un par un pour que ce soit plus lisible</h5></label>
                            <label><h5>Nouveau paragraphe pour la FAQ:  {data.sujet}</h5></label>
                            <textarea
                                type="text"
                                className="form-control"
                                placeholder="Ecrire le nouveau paragraphe"
                                rows={5}
                                onChange={(e)=>setParagraphe(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div>
                            <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                            <br></br>
                            </div>
                        )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                        <div className="form-group">
                            <input type="submit" className="btn btn-primary float-right" value="Ajouter un paragraphe" />
                        </div>
                    </form>
                    <br></br>
                    <h4 style={{textAlign: "center"}}><Link to={"/admin/faq/gerer"}>Retour</Link></h4>
                </div>
            </div>
            )}
        </div>
    )
}