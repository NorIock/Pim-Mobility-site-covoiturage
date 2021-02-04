import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherDepartsDestinationsPourAjoutQuartier(){

    const [departData, setDepartData] = useState([]);
    const [destinationData, setDestinationData] = useState([]);
    const [depart] = useState("depart");
    const [destination] = useState("destination");

    const history = useHistory();

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchDepartsData(){
            const departResult = await Requete.get(
                "/departs/afficher",
            );
            setDepartData(departResult.data);
        }
        fetchDepartsData();

        async function fetchDestinationData(){
            const destinationResult = await Requete.get(
                "/destinations/afficher",
            );
            setDestinationData(destinationResult.data);
        }
        fetchDestinationData();
    }, []);

    return(
        <div>
            {(departData.length === 0 || destinationData.length === 0) ? (
                <h3 style={{textAlign: "center", marginTop: "80px"}}>Chargement...</h3>
            ) : (
                <div className="container" style={{marginTop: "80px"}}>
                    <div className="row">
                        <div className=" col-sm-12 col-md-12 col-lg-6 col-xl-6">
                            <table className="table affichage-profil">
                                <thead>
                                    <tr>
                                        <th><h4 style={{textAlign: "center"}}>Départs</h4></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departData.map(departs =>(
                                        <tr key={departs._id} className="hover-ponctuel" onClick={()=>history.push("/admin/quartier/ajouter/" + depart + "/" + departs._id)}>
                                            <td><h5>{departs.nom}{departs.quartiers.length === 1 ? <span>: {departs.quartiers.length} quartier</span> : departs.quartiers.length > 1 ? <span>: {departs.quartiers.length} quartiers</span> : null}</h5></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className=" col-sm-12 col-md-12 col-lg-6 col-xl-6">
                            <table className="table affichage-profil">
                                <thead>
                                    <tr>
                                        <th><h4 style={{textAlign: "center"}}>Destinations</h4></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {destinationData.map(destinations =>(
                                        <tr key={destinations._id} className="hover-ponctuel" onClick={()=>history.push("/admin/quartier/ajouter/" + destination + "/" + destinations._id)}>
                                            <td><h5>{destinations.nom}{destinations.quartiers.length === 1 ? <span>: {destinations.quartiers.length} quartier</span> : destinations.quartiers.length > 1 ? <span>: {destinations.quartiers.length} quartiers</span> : null}</h5></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}