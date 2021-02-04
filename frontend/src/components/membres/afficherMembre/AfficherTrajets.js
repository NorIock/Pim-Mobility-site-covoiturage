import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';

export default function AfficherMesTrajets(){

    const [data, setData] = useState([]);
    const [trajetAllerData, setTrajetAllerData] = useState([]) // Comme il n'est pas possible de trier par jour dans un populate, je récupère indépendemment afin de faire le tri
    const [trajetRetourData, setTrajetRetourData] = useState([]) // Comme il n'est pas possible de trier par jour dans un populate, je récupère indépendemment afin de faire le tri
    const [trajetAller] = useState("aller"); // Permet d'insérer le type de trajet pour le lien qui emmène au détail d'un covoiturage 
    const [trajetRetour] = useState("retour"); // Permet d'insérer le type de trajet pour le lien qui emmène au détail d'un covoiturage

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

            const trajetAllerResult = await Requete.get(
                "/trajetsAller/afficher/" + id,
                { headers: { "x-auth-token": token } },
            );
            setTrajetAllerData(trajetAllerResult.data);

            const trajetRetourResult = await Requete.get(
                "/trajetsRetour/afficher/" + id,
                { headers: { "x-auth-token": token } },
            );
            setTrajetRetourData(trajetRetourResult.data);
        };
        fetchData();
        
    }, [id, token]);

    return(
        <div sytle={{marginTop: "80px"}}>
            {(data.length === 0 || trajetAllerData.length === 0 || trajetRetourData.length === 0) ? (
                <h3 style={{ marginTop: "100px", textAlign: "center"}}>Chargement...</h3>
            ) : 
            (trajetAllerData === "Queud" && trajetRetourData === "Queud") ? 
            <div style={{textAlign: "center", marginTop: "30px"}}>
            {data.role === undefined && // Si le membre a interrompu avant de choisir son rôle
            <div>
                <h3 style={{color: "red"}}>La création de votre profil n'est pas complète,</h3>
                <h4>Vous pouvez la continuer en cliquant <Link to={"/inscription/part2/" + id}>ici</Link></h4>
            </div>
            }

            {data.trajets_aller.length === 0 && data.role && // Si le membre a interrompu avant de créer ses trajets aller
            <div>
                <h3 style={{color: "red"}}>La création de votre profil n'est pas complète,</h3>
                <h4>Vous pouvez la continuer en cliquant <Link to={"/aller/creer/" + id}>ici</Link></h4>
            </div>
            }

            {data.trajets_retour.length === 0 && data.trajets_aller.length !== 0 && data.role && // Si le membre a interrompu avant de créer ses trajets retour
            <div>
                <h3 style={{color: "red"}}>La création de votre profil n'est pas complète,</h3>
                <h4>Vous pouvez la terminer en cliquant <Link to={"/retour/creer/" + id}>ici</Link></h4>
            </div>
            }
        </div>
            : (
                <div className="container">
                    <div className="row">
                        <div className=" col-sm-12 col-md-12 col-lg-6 col-xl-6">
                            <table className="table affichage-profil">
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: "center"}}>Trajets aller</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trajetAllerData !== "Queud" &&
                                    <>
                                        {trajetAllerData.map(aller => (
                                            <tr key={aller._id}>
                                                <td>
                                                    <h5>{aller.jour} à {aller.heure_de_depart_en_string}</h5>
                                                    <h5>Part de {aller.depart}{aller.depart_quartier && <span>, {aller.depart_quartier}</span>}</h5>
                                                    <h5>Pour {aller.destination}{aller.destination_quartier && <span>, {aller.destination_quartier}</span>}</h5>
                                                    {data.role !== "Je suis passager exclusif" &&
                                                        <h5>Places disponibles: {aller.nombre_de_places}/{aller.nombre_de_places_total}</h5>
                                                    }
                                                    {aller.conducteur_sur_ce_trajet === true &&
                                                        <div>
                                                        {aller.nombre_de_places_total - aller.nombre_de_places === 1 &&
                                                            <h5><Link to={"/trajet/detail/equipage/" + aller._id + "/" + id}>{aller.nombre_de_places_total - aller.nombre_de_places} passager trouvé</Link></h5>
                                                        }

                                                        {aller.nombre_de_places_total - aller.nombre_de_places > 1 &&
                                                            <h5><Link to={"/trajet/detail/equipage/" + aller._id + "/" + id}>{aller.nombre_de_places_total - aller.nombre_de_places} passagers trouvés</Link></h5>
                                                        }
                                                        </div>
                                                    }
                                                    {aller.passager_sur_autre_trajet === true &&
                                                        <h5><Link to={"/monCovoiturage/afficher-un/" + id + "/" + aller.jour + "/" + trajetAller}>Covoiturage trouvé</Link></h5>
                                                    }
                                                    <h6><Link to={"/trajet/aller/modifier/" + aller._id + "/" + id + "/" + aller.depart + "/" + aller.destination}>Modifier ce trajet</Link></h6>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                    }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                            {data.trajets_aller.length < 7 &&
                                                <Link to={"/nouveau-trajet/aller/" + id}>Ajouter trajets</Link>
                                            }
                                            {data.trajets_aller.length !== 0 &&
                                                <Link to={"/trajet/aller/supprimer/" + id}>Supprimer trajets</Link>
                                            }
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className=" col-sm-12 col-md-12 col-lg-6 col-xl-6">
                            <table className="table affichage-profil">
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: "center"}}>Trajets retour</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trajetRetourData !== "Queud" &&
                                    <>
                                        {trajetRetourData.map(retour => (
                                            <tr key={retour._id}>
                                                <td>
                                                    <h5>{retour.jour} à {retour.heure_de_depart_en_string}</h5>
                                                    <h5>Part de {retour.depart}{retour.depart_quartier && <span>, {retour.depart_quartier}</span>}</h5>
                                                    <h5>Pour {retour.destination}{retour.destination_quartier && <span>, {retour.destination_quartier}</span>}</h5>
                                                    {data.role !== "Je suis passager exclusif" &&
                                                        <h5>Places disponibles: {retour.nombre_de_places}/{retour.nombre_de_places_total}</h5>
                                                    }
                                                    {retour.conducteur_sur_ce_trajet === true &&
                                                        <div>
                                                        {retour.nombre_de_places_total - retour.nombre_de_places === 1 &&
                                                            <h5><Link to={"/trajet/detail/equipage/" + retour._id + "/" + id}>{retour.nombre_de_places_total - retour.nombre_de_places} passager trouvé</Link></h5>
                                                        }
    
                                                        {retour.nombre_de_places_total - retour.nombre_de_places > 1 &&
                                                            <h5><Link to={"/trajet/detail/equipage/" + retour._id + "/" + id}>{retour.nombre_de_places_total - retour.nombre_de_places} passagers trouvés</Link></h5>
                                                        }
                                                        </div>
                                                    }
                                                    {retour.passager_sur_autre_trajet === true &&
                                                        <h5><Link to={"/monCovoiturage/afficher-un/" + id + "/" + retour.jour + "/" + trajetRetour}>Covoiturage trouvé</Link></h5>
                                                    }
                                                    <h6><Link to={"/trajet/retour/modifier/" + retour._id + "/" + id + "/" + retour.depart + "/" + retour.destination}>Modifier ce trajet</Link></h6>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                    }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                                            {data.trajets_retour.length < 7 &&
                                                <Link to={"/nouveau-trajet/retour/" + id}>Ajouter trajets</Link>
                                            }
                                            {data.trajets_retour.length !== 0 &&
                                                <Link to={"/trajet/retour/supprimer/" + id}>Supprimer trajets</Link>
                                            }
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}