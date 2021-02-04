import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherTousLesAdmins(){

    const [data, setData] = useState([]);
    const { from } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }
    
    useEffect(()=>{

        async function fetchData(){
            const result = await Requete.get(
                "/membres/afficher-admin",
                { headers: { "x-auth-token": token } }
            );
            setData(result.data);
        };
        fetchData();
    }, [token]);

    return(
        <div className="container" style={{marginTop: "80px"}}>
            <div className="affichage-stat">
            <h5>{data.length < 2 ? (<span>Administrateur</span>) : (<span>Administrateurs</span>)}: {data.length}</h5>
            <table className="table">
                <tbody>
                    {data.map((admins) =>
                        <tr key={admins._id} onClick={()=>history.push("/admin/admins/afficher-un/" + admins._id + "/" + from)}>
                            <td>{admins.nom}</td>
                            <td>{admins.prenom}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
            <h4 style={{textAlign: "center"}}><Link to={"/admin/450754/ajouter-admin/6532467899"}>Ajouter un nouvel administrateur</Link></h4>
            {from === "statistique" &&
                <h4 style={{ textAlign: "center" }}><Link to={"/admin/statistiques"}>retour</Link></h4>
            }
        </div>
    )
}