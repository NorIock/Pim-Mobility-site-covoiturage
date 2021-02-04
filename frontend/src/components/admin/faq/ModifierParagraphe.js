import React, {useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function ModifierParagrapheFAQ(){

    const [data, setData] = useState([]);
    const [error, setError] = useState();
    const [paragraphe, setParagraphe] = useState();

    const { paragrapheId, from, faqId } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/FAQ/paragraphe/recuperer-pour-modif/" + paragrapheId,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();
    }, [paragrapheId, token])

    const onSubmit = async function(e){
        e.preventDefault();
        try{
            const majParagraphe = { paragraphe };

            await Requete.put(
                "/FAQ/paragraphe/modifier/" + paragrapheId,
                majParagraphe,
                { headers: { "x-auth-token": token } }
            )
            if(from === "depuis ajout"){history.push("/admin/faq/ajouter/paragraphe/" + faqId)}
            if(from === "depuis afficher"){history.push("/admin/faq/afficher-une/" + faqId)}

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement...</h3>
            ) : (
                <div className="card container">
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>Modifiez le paragraphe</label>
                            <textarea
                                type="text"
                                placeholder="Faites votre modification"
                                className="form-control"
                                rows={5}
                                defaultValue={data.paragraphe}
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
                            <input type="submit" className="btn btn-primary float-right" value="modifier" />
                        </div>
                    </form>
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