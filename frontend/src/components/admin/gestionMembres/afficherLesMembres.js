import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherTousLesMembres(){

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
                "/membres/afficher-tous",
                { headers: { "x-auth-token": token } }
            );
            setData(result.data);
        };
        fetchData();
    }, [token]);

    return(
        <div className="container" style={{marginTop: "80px"}}>
            <div className="affichage-stat">
            <h5>{data.length < 2 ? (<span>Membre</span>) : (<span>Membres</span>)}: {data.length}</h5>
            <table className="table">
                <tbody>
                    {data.map((membres) =>
                        <tr key={membres._id} onClick={()=>history.push("/membre/" + membres._id)}>
                            <td>{membres.nom}</td>
                            <td>{membres.prenom}</td>
                            <td>{membres.role}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
            {from === "statistique" &&
                <h4 style={{ textAlign: "center" }}><Link to={"/admin/statistiques"}>retour</Link></h4>
            }
        </div>
    )
}