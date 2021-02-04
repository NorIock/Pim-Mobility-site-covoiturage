import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherAdmin(){

    const [data, setData] = useState([]);
    const { adminId, from } = useParams();
    
    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                '/membres/afficher-un/' + adminId,
                { headers: { "x-auth-token": token } },
            );
            setData(result.data);
        };
        fetchData();
    }, [adminId, token]);

    return(
        <div sytle={{marginTop: "80px"}}>
            {data.length === 0 ? (
                <h3 style={{ marginTop: "100px", textAlign: "center"}}>Chargement...</h3>
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    <table className="table affichage-profil">
                        <thead>
                            <tr>
                                <th style={{ textAlign: "center"}}>Profil d'un administrateur</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <h5><strong>Nom: </strong>{data.nom}</h5>
                                    <h5><strong>Prénom: </strong>{data.prenom}</h5>
                                    <h5><strong>Email: </strong>{data.email}</h5>
                                    <h5><strong>Téléphone: </strong>{data.telephone}</h5>
                                    <h5><strong>Administrateur depuis le: </strong>{new Intl.DateTimeFormat('fr-Fr',{ month:'numeric',day:'2-digit',year:'numeric', hour: 'numeric', minute: 'numeric'}).format(new Date(data.date_inscription))}</h5>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <th style={{textAlign: "center"}}>
                                    <Link to={"/admin/admins/supprimer/" + data._id}>Supprimer</Link>
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                    <h4 style={{textAlign: "center"}}><Link to={"/admin/admins/afficher-tous/" + from}>Retour</Link></h4>
                </div>
            )}
        </div>
    )
}