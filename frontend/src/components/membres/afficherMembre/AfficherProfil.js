import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherMonProfil(){

    const [data, setData] = useState([]);
    const { id } = useParams();
    
    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                '/membres/afficher-un/' + id,
                { headers: { "x-auth-token": token } },
            );
            setData(result.data);
        };
        fetchData();
    }, [id, token]);

    return(
        <div sytle={{marginTop: "80px"}}>
            {data.length === 0 ? (
                <h3 style={{ marginTop: "100px", textAlign: "center"}}>Chargement...</h3>
            ) : (
                <div className="container">
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{ textAlign: "center"}}>Profil</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <h5><strong>Nom: </strong>{data.nom}</h5>
                                    <h5><strong>Prénom: </strong>{data.prenom}</h5>
                                    <h5><strong>Email: </strong>{data.email}</h5>
                                    <h5><strong>Téléphone: </strong>{data.telephone}</h5>
                                    {data.commune_entreprise &&
                                        <h5><strong>Travaille à: </strong>{data.commune_entreprise}</h5>
                                    }
                                    <h5><strong>Rôle: </strong>{data.role}</h5>
                                    {data.role !== "Je suis passager exclusif" &&
                                        <h5><strong>Mode de paiement souhaité: </strong>{data.mode_paiement}</h5>
                                    }
                                    {data.indisponible ? (
                                        <h5><strong>Apparaître dans les recherches de covoiturage planifiées: </strong>
                                        <Link to={"/membres/disponible/" + id}>Non</Link>
                                        </h5>
                                    ) : (
                                        <h5><strong>Apparaître dans les recherches de covoiturage planifiées: </strong>
                                        <Link to={"/membres/disponible/" + id}>Oui</Link>
                                        </h5>
                                    )}
                                    <h5><strong>Membre depuis le: </strong>{new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(data.date_inscription))}</h5>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <th style={{textAlign: "center"}}>
                                    <Link to={"/membres/verifier-mdp/" + data._id}>Modifier</Link>
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    )
}