import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherMessageNonPassagerExclusifEtPasDePlace(){

    // Se lancera si lorsqu'un membre qui était passager exclusif change de rôle pour qu'il créé un nombre de place pour le matching

    const [data, setData] = useState([]);
    const [membreData, setMembreData] = useState([]);
    const { id } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }
    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/membres/places-conformes/" + id,
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData()

        async function fetchMembreData(){
            const resultMembre = await Requete.get(
                '/membres/afficher-un/' + id,
                { headers: { "x-auth-token": token } },
            )
            setMembreData(resultMembre.data);
        }
        fetchMembreData();

    }, [token, id]);

    return(
        <div>
            {(data.length === 0 || membreData.length === 0) ? (
                <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement...</h3>
            ) 
            : data === "Houston nous avons un problème" ? (
                <div className="container">
                    <table className="table alerte">
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>Attention</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>
                                    <h4>Attention, votre précédent rôle était passager exclusif et vous avez changé pour: "{membreData.role}"</h4>
                                    <h4>Pour pouvoir apparaître lors des requêtes de matching, veuillez indiquer un nombre de place disponible pour chaques trajets</h4>
                                    <h4>Vous pouvez faire cette modification sur cette page</h4>
                                </th>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : null
            }
        </div>
    )
}