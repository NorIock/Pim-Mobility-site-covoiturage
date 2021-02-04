import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom'; // Permet de remplacer le this.props.match.params.id que j'utilisais avec les classes

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';
import DropdownMenuQuartier from '../../../middlewares/dropdownMenu/DropdownMenuQuartiers';
import DropddownMenuDepartDestination from '../../../middlewares/dropdownMenu/DropdownMenuDepartDestination';
import DropddownMenuHeureMinute from '../../../middlewares/dropdownMenu/DropdownMenuHeureMinute';

export default function ModifierAller(){

    const [membreData, setMembreData] = useState([]); // Récupère les données du membre afin de savoir si on fait apparaître la modification du nombre de places en fonction de son rôle
    const [trajet_data, setTrajetData] = useState([]); // Recupère les données du trajet à modifier
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

    useEffect(() => {

        async function fetchDepartData(){ // Pour le menu déroulant des départs
            const departResult = await Requete.get(
                '/departs/afficher',
            )
            setDepartData(departResult.data);
        };
        fetchDepartData();

        async function fetchDestinationData(){ // Pour le menu déroulant des destinations
            const destinationResult = await Requete.get(
                "/destinations/afficher",
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

    useEffect(function(){ // Pour afficher les valeurs déjà enregistrées dans les différents champs

        async function fetchTrajetData(){
            const trajetResult = await Requete.get(
                "/trajetsAller/afficher-un/" + id,
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

    // Permet de télécharger les quartiers qui correspondent au départ sélectionné
    useEffect(()=>{
        setDepartQuartierData(); // On remet en vide pour que le menu déroulant des quartiers disparaisse si jamais on passe sur un départ sans quartier
        async function fetchDepartQuartierData(){
            if(depart){
                const departQuartierResult = await Requete.get(
                    "/quartier/afficher-selon-depart/" + depart
                )
                setDepartQuartierData(departQuartierResult.data);
            } else {
                const departQuartierResult = await Requete.get(
                    "/quartier/afficher-selon-depart/" + paramsDepart  
                )
                setDepartQuartierData(departQuartierResult.data);
            }
        }  
        fetchDepartQuartierData();

    }, [depart, paramsDepart])

    // Permet de télécharger les quartiers qui correspondent à la destination sélectionnée
    useEffect(()=>{
        setDestinationQuartierData(); // On remet en vide pour que le menu déroulant des quartiers disparaisse si jamais on passe sur un départ sans quartier
        async function fetchDestinationQuartierData(){
            if(destination){
                const destinationQuartierResult = await Requete.get(
                    "/quartier/afficher-selon-destination/" + destination
                )
                setDestinationQuartierData(destinationQuartierResult.data);
            } else {
                const destinationQuartierResult = await Requete.get(
                    "/quartier/afficher-selon-destination/" + paramsDestination
                )
                setDestinationQuartierData(destinationQuartierResult.data); 
            }
        }  
        fetchDestinationQuartierData();

    }, [destination, paramsDestination])

    const submit = async function(e){
        e.preventDefault();

        try{
            const MajTrajet = { depart, quartierDepartData, heures_de_depart, minutes_de_depart, destination, quartierDestinationData, nombre_de_places };
            await Requete.put(
                "/trajetsAller/maj/" + id,
                MajTrajet,
                { headers : { "x-auth-token": token}},
            );
            history.push("/membre/" + membre);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    };

    return(
        console.log("trajet_data.data", trajet_data.data),
        console.log("depart: ", depart),
        console.log("departQuartierData", departQuartierData),
        console.log("destinationQuartierData", destinationQuartierData),
        <div>
            {(trajet_data.length === 0 || membreData.length === 0) ? (
                <p>Téléchargement...</p>
            ) : (   
            <div className="col-md-12">
                <div className="card card-container">
                    {error && (
                        <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                    )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                    <h4>Modification de l'aller du {trajet_data.data.jour}:</h4>
                    <form onSubmit={submit}>
                        <div className="form-group">
                            <label>Vous partez de:</label>
                            <DropddownMenuDepartDestination
                            onChange={departChange}
                            donneesMap = {depart_data}
                            valeurDefaut = {trajet_data.data.depart}
                            />
                        </div>
                        {(departQuartierData !== undefined) &&
                        <div>
                        {departQuartierData.length !== 0 &&
                            <div className="form-group">
                            <label>Quelle zone de {depart}:</label>
                            <DropdownMenuQuartier
                                onChange={(e)=>{setQuartierDepartData(e.target.value)}}
                                donneesMap = {departQuartierData}
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
                        {(destinationQuartierData !== undefined) &&
                            <div>
                            {destinationQuartierData.length !== 0 &&
                                <div className="form-group">
                                <label>Quelle zone de {destination}:</label>
                                <DropdownMenuQuartier
                                    onChange={(e)=>{setQuartierDestinationData(e.target.value)}}
                                    donneesMap = {destinationQuartierData}
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
