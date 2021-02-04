import React, { useState, useEffect } from 'react';
import {useParams, Link, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function ModifierActualite(){

    const [data, setData] = useState([]);
    const [typesActualite, setTypesActualite] = useState([]);
    const [type, setType] = useState();
    const [titre, setTitre] = useState();
    const [contenu, setContenu] = useState();
    const [visible, setVisible] = useState();
    const [error, setError] = useState();

    const { actualiteId } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token"); // Permet de récupérer le token afin de l'envoyer dans la requête
    if(token === null){ // S'il n'y a pas de token dans le local storage, cela crée une erreur. Avec ce if, cela nous permet que s'il est null lui attribuer une valeur et éviter une erreur
        localStorage.setItem("auth-token", "");
        token="";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/actualites/afficher-une-pour-maj/" + actualiteId,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();

        async function fetchTypeActualiteData(){
            const typeResult = await Requete.get(
                "/actualites/menu-deroulant/afficher"
            )
            setTypesActualite(typeResult.data);
        }
        fetchTypeActualiteData();
    },[token, actualiteId]);

    let optionItems = typesActualite.map((typeActualite => 
        <option key={typeActualite.nom} value={typeActualite.nom}>{typeActualite.nom}</option>
    ));

    const submit = async function(e){
        e.preventDefault();

        try{
            const modifierActualite = { type, titre, contenu, visible };

            await Requete.post(
                "/actualites/modifier/" + actualiteId,
                modifierActualite,
                { headers: { "x-auth-token": token } },
            )
            history.push("/admin/actualites/afficher-toutes");

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div className="admin-display">
            <form onSubmit={submit}>
            <div className="form-inline">
                    <h3><label className="my-1 mr-2">Apparaît sur la page d'accueil:</label></h3>
                    <select
                        className="form-control"
                        onChange={(e)=>setVisible(e.target.value)}
                    >
                        <option>Choisir</option>
                        <option>Oui</option>
                        <option>Non</option>
                    </select>
                </div>
                <div className="form-inline">
                    <h3><label className="my-1 mr-2">Quel type d'actualité:</label></h3>
                    <select
                        defaultValue={data.type}
                        className="form-control"
                        onChange={(e)=>setType(e.target.value)}
                    >
                        <option>Choisir</option>
                        {optionItems}
                    </select>
                </div>
                <div className="form-group">
                    <label><h3>Titre:</h3></label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={data.titre}
                        defaultValue={data.titre}
                        onChange={(e)=>setTitre(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label><h3>Contenu:</h3></label>
                    <textarea
                        type="text"
                        className="form-control"
                        placeholder={data.contenu}
                        defaultValue={data.contenu}
                        rows={5}
                        onChange={(e)=>setContenu(e.target.value)}
                    />
                </div>
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la fonction anonyme supprime quand on clique */}
                <div className="form-group">
                    <input
                        type="submit"
                        value="Modifier"
                        className="btn btn-primary"
                    />
                </div>
            </form>
            <h4 style={{textAlign: "center"}}><Link to={"/admin/actualites/afficher-toutes"}>Retour</Link></h4>
        </div>
    )
}