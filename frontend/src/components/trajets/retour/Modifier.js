import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';
import DropdownMenuQuartier from '../../../middlewares/dropdownMenu/DropdownMenuQuartiers';
import DropddownMenuDepartDestination from '../../../middlewares/dropdownMenu/DropdownMenuDepartDestination';
import DropddownMenuHeureMinute from '../../../middlewares/dropdownMenu/DropdownMenuHeureMinute';

export default function ModifierRetour(){

    const [membreData, setMembreData] = useState([]); // Récupère les données du membre afin de savoir si on fait apparaître la modification du nombre de places en fonction de son rôle
    const [trajet_data, setTrajetData] = useState([]); // Récupère les données du trajet à modifier
    const [depart_data, setDepartData] = useState([]); // Pour le menu déroulant des départs
    const [depart, setDepart] = useState();
    const [departQuartierData, setDepartQuartierData] = useState([]); // Permet de récupérer les quartiers de depart pour le menu déroulant
    const [quartierDepartData, setQuartierDepartData] = useState();
    const [heuresData, setHeuresData] = useState([]); // Pour le menu déroulant des heures
    const [heures_de_depart, setHeuresDeDepart] = useState();
    const [minutesData, setMinutesData] = useState([]); // Pour me menu déroulant des minutes
    const [minutes_de_depart, setMinutesDeDepart] = useState();
    const [destination_data, setDestinationData] = useState([]); // Pour le menu déroulant des destinations
    const [destination, setDestination] = useState();
    const [destinationQuartierData, setDestinationQuartierData] = useState([]); // Permet de récupérer les quartiers  de destination pour le menu déroulant
    const [quartierDestinationData, setQuartierDestinationData] = useState();
    const [nombrePlaces_data, setNombreDePlacesData] = useState([]); // Pour le menu déroulant du nombres de places
    const [nombre_de_places, setNombreDePlaces] = useState();

    const [error, setError] = useState();
    const { id, membre, paramsDepart, paramsDestination } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    // Permet de remettre à zéro quartierDepartData quand on change de départ
    const departChange = (e) => {
        setDepart(e.target.value);
        setQuartierDepartData();
    }

    // Permet de remettre à zéro quartierDestinationData quand on change de destination
    const destinationChange = (e) => {
        setDestination(e.target.value);
        setQuartierDestinationData();
    }

    // Permet de télécharger les quartiers qui correspondent au départ sélectionné, comme il s'agit des trajets retours, on inverse départ et destination
    useEffect(()=>{
        setDepartQuartierData(); // On remet en vide pour que le menu déroulant des quartiers disparaisse si jamais on passe sur un départ sans quartier
        async function fetchDepartQuartierData(){
            if(destination){
                const departQuartierResult = await Requete.get(
                    "/quartier/afficher-selon-depart/" + destination
                )
                setDepartQuartierData(departQuartierResult.data);
            } else {
                const departQuartierResult = await Requete.get(
                    "/quartier/afficher-selon-depart/" + paramsDestination
                )
                setDepartQuartierData(departQuartierResult.data);
            }
        }  
        fetchDepartQuartierData();

    }, [destination, paramsDestination])

    // Permet de télécharger les quartiers qui correspondent à la destination sélectionnée, comme il s'agit des trajets retours, on inverse départ et destination
    useEffect(()=>{
        setDestinationQuartierData(); // On remet en vide pour que le menu déroulant des quartiers disparaisse si jamais on passe sur un départ sans quartier
        async function fetchDestinationQuartierData(){
            if(depart){
                const destinationQuartierResult = await Requete.get(
                    "/quartier/afficher-selon-destination/" + depart
                )
                setDestinationQuartierData(destinationQuartierResult.data);
            } else {
                const destinationQuartierResult = await Requete.get(
                    "/quartier/afficher-selon-destination/" + paramsDepart
                )
                setDestinationQuartierData(destinationQuartierResult.data);
            }
        }  
        fetchDestinationQuartierData();

    }, [depart, paramsDepart])

    useEffect(function(){

        async function fetchDepartData(){
            const departResult = await Requete.get(
                '/destinations/afficher', // On inverse car pour le chemin du retour, le depart devient la destination
            )
            setDepartData(departResult.data);
        };
        fetchDepartData();

        async function fetchDestinationData(){
            const destinationResult = await Requete.get(
                "/departs/afficher", // On inverse car pour le chemin du retour, la destination devient le départ
            );
            setDestinationData(destinationResult.data);
        };
        fetchDestinationData();

        async function fetchHeuresData(){ // Pour le menu déroulant des heures
            const heuresResult = await Requete.get(
                "/heures/afficher"
            );
            setHeuresData(heuresResult.data);
        };
        fetchHeuresData();

        async function fetchMinutesData(){ // Pour le menu déroulant des minutes
            const minutesResult = await Requete.get(
                "/minutes/afficher"
            );
            setMinutesData(minutesResult.data);
        };
        fetchMinutesData();

        async function fetchNombrePlacesData(){ // Pour le menu déroulant de nombre de places disponibles
            const nombrePlacesResult = await Requete.get(
                "/nombrePlacesPassagers/afficher"
            );
            setNombreDePlacesData(nombrePlacesResult.data);
        };
        fetchNombrePlacesData();
    }, []);

    let nombrePlacesOptionItems = nombrePlaces_data.map((nombrePlaces =>
        <option key={nombrePlaces.nombre} value={nombrePlaces.nombre}>{nombrePlaces.nombre}</option>
    ));

    useEffect(function(){

        async function fetchTrajetData(){
            const trajetResult = await Requete.get(
                "/trajetsRetour/afficher-un/" + id,
            );
            setTrajetData(trajetResult);
        };
        fetchTrajetData();

        async function fetchMembreData(){
            const membreResult = await Requete.get(
                '/membres/afficher-un/' + membre,
                { headers: { "x-auth-token": token } },
            )
            setMembreData(membreResult.data);
        }
        fetchMembreData();

    }, [id, membre, token]);

    const submit = async function(e){
        e.preventDefault();

        try{
            const MajTrajet = { depart, quartierDepartData, heures_de_depart, minutes_de_depart, destination, quartierDestinationData, nombre_de_places };
            await Requete.put(
                "/trajetsRetour/maj/" + id,
                MajTrajet,
                { headers: { "x-auth-token": token } }
            );
            history.push('/membre/' + membre);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    };

    return(
        <div>
            {(trajet_data.length === 0 || membreData.length === 0) ? (
                <p>Téléchargement...</p>
            ) : (   
            <div className="col-md-12">
                <div className="card card-container">
                    {error && (
                        <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                    )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                    {/* <h4>Modification de l'aller du {trajet_data.data.jour}:</h4> */}
                    <h4>Modification du retour du {trajet_data.data.jour}:</h4>
                    <form onSubmit={submit}>
                        <div className="form-group">
                            <label>Vous partez de:</label>
                            <DropddownMenuDepartDestination
                                onChange={departChange}
                                donneesMap = {depart_data}
                                valeurDefaut = {trajet_data.data.depart}
                            />
                        </div>
                        {(destinationQuartierData !== undefined) &&
                            <div>
                            {destinationQuartierData.length !== 0 &&
                                <div className="form-group">
                                <label>Quelle zone de {depart}:</label>
                                <DropdownMenuQuartier
                                    onChange={(e)=>{setQuartierDepartData(e.target.value)}}
                                    donneesMap = {destinationQuartierData}
                                    valeurDefaut = {trajet_data.data.depart_quartier}
                                />
                                </div>
                            }
                            </div>
                        }
                        <div className='form-group row col-md-12'>
                            <label>Heure de départ:</label>
                            <div className="col-md-3">
                                <DropddownMenuHeureMinute
                                    onChange={(e)=>setHeuresDeDepart(e.target.value)}
                                    donneesMap = {heuresData}
                                    valeurDefaut = {trajet_data.data.depart_heures}
                                />
                            </div>
                            <label>h</label>
                            <div className="col-md-3">
                                <DropddownMenuHeureMinute
                                    onChange={(e)=>setMinutesDeDepart(e.target.value)}
                                    donneesMap = {minutesData}
                                    valeurDefaut = {trajet_data.data.depart_minutes}
                                />
                            </div>
                        </div>
                        <div className='form-group'>
                            <label>Vous allez à:</label>
                            <DropddownMenuDepartDestination
                                onChange={destinationChange}
                                donneesMap = {destination_data}
                                valeurDefaut = {trajet_data.data.destination}
                            />
                        </div>
                        {(departQuartierData !== undefined) &&
                            <div>
                            {departQuartierData.length !== 0 &&
                                <div className="form-group">
                                <label>Quelle zone de {destination}:</label>
                                <DropdownMenuQuartier
                                    onChange={(e)=>{setQuartierDestinationData(e.target.value)}}
                                    donneesMap = {departQuartierData}
                                    valeurDefaut = {trajet_data.data.destination_quartier}
                                />
                                </div>
                            }
                            </div>
                        }
                        {membreData.role !== "Je suis passager exclusif" &&
                            <div className="form-group row col-md-12">
                                <label>Nombre de places disponibles:</label>
                                <div className="col-md-3">
                                <select 
                                    className='form-control'
                                    defaultValue={trajet_data.data.nombre_de_places_total}
                                    onChange={(e)=>setNombreDePlaces(e.target.value)}
                                >
                                    {nombrePlacesOptionItems}
                                </select>
                                </div>
                            </div>
                        }
                        <div className="form-group">
                            <input
                                className="btn btn-primary"
                                type="submit"
                                value="Modifier"
                            />
                            <p><Link to={"/membre/" + membre}>Retour</Link></p>
                        </div>
                    </form>
                </div>
        </div>
    )}
    </div>
    )
}