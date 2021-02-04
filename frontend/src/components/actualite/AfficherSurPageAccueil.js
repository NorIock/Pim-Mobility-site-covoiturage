import React, { useState, useEffect } from 'react';

import Requete from '../../middlewares/Requete';

export default function AfficherActualitePageAccueil(){

    const [data, setData] = useState([]);
    const [noData, setNoData] = useState(false);

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/actualites/visible",
            )
            if(result.data === "Queud"){
                setNoData(true);
            }
            setData(result.data);
        }
        fetchData();
    }, []);

    return(
        <div>
        {data.length === 0 ? (
            <h3 style={{marginTop: "80px", textAlign: "center"}}>Chargement...</h3>
        ) : 
        noData === true ? (
            null
        ) :
        (
            <div className="container" style={{marginTop: "10px"}}>
                {data.map(actualite => (
                    (actualite.type === "Information" || actualite.type === "Nouvelle fonctionnalité") ?
                    <table key={actualite._id} className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>
                                    {actualite.type} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(actualite.date))}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <h5 style={{textDecoration: "underline"}}>{actualite.titre}</h5>
                                    <h5>{actualite.contenu}</h5>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    :
                    actualite.type === "Alerte" ?
                    <table key={actualite._id} className="table alerte">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>
                                    {actualite.type} le {new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(actualite.date))}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <h5 style={{textDecoration: "underline"}}>{actualite.titre}</h5>
                                    <h5>{actualite.contenu}</h5>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    : null
                ))}
            </div>
        )}
        </div>
    )
}