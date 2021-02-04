import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../../middlewares/Requete';
import StatistiqueConducteurs from './membresDetail/Conducteurs';
import StatistiquePassagersEtConducteurs from './membresDetail/PassagersEtConducteurs';
import StatistiqueConducteursEtPassagers from './membresDetail/ConducteurEtPassager';
import StatistiquePassagers from './membresDetail/Passagers';
import StatistiqueIndisponibleMatching from './membresDetail/IndisponibleMatching';
import StatistiqueUneEtapeCreationProfil from './membresDetail/1EtapeCreationProfil';
import StatistiqueDeuxEtapesCreationProfil from './membresDetail/2EtapesCreationProfil';

export default function StatistiquesMembres(){

    const [data, setData] = useState([]);
    const history = useHistory();
    let from = "statistique";

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/membres/afficher-tous",
                { headers: { "x-auth-token": token } },
            )
            setData(result.data);
        }
        fetchData();
    }, [token]);

    return(
        <div>
            {data.length === 0 ? (
                <h3 style={{textAlign: "center"}}>Chargement...</h3>
            ): 
            <div style={{marginTop: "5px"}}>
                <div className="affichage-stat">
                    <h5>Membres: {data.length}</h5>
                    <table className="table">
                        <tbody>
                            <tr onClick={()=>history.push("/admin/membres/afficher-tous/" + from)}>
                                <td style={{width: "95%"}}>Total:</td>
                                <td>{data.length}</td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/membres/conducteurs")}>
                                <td style={{width: "95%"}}>Je suis conducteur exclusif:</td>
                                <td><StatistiqueConducteurs /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/membres/conducteurs-et-passagers")}>
                                <td style={{width: "95%"}}>Je suis conducteur mais disposé à me mettre en passager:</td>
                                <td><StatistiqueConducteursEtPassagers /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/membres/passagers-et-conducteurs")}>
                                <td style={{width: "95%"}}>Je suis passager et conducteur occasionnel:</td>
                                <td><StatistiquePassagersEtConducteurs /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/membres/passagers")}>
                                <td style={{width: "95%"}}>Je suis passager exclusif:</td>
                                <td><StatistiquePassagers /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/membres/indisponibles")}>
                                <td style={{width: "95%"}}>Ne souhaite pas apparaître dans le matching:</td>
                                <td><StatistiqueIndisponibleMatching /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/membre/1-etape")}>
                                <td style={{width: "95%"}}>N'ont fait que la première étape de la création de profil (n'ont pas de rôle):</td>
                                <td><StatistiqueUneEtapeCreationProfil /></td>
                            </tr>
                            <tr onClick={()=>history.push("/admin/membre/2-etapes")}>
                                <td style={{width: "95%"}}>N'ont fait que les 2 premières étapes de la création de profil (n'ont pas créé de trajets):</td>
                                <td><StatistiqueDeuxEtapesCreationProfil /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            }
        </div>
    )
}