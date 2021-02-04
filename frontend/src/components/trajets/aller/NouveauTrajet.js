import React, { useState, useEffect } from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';
import Checkbox from '../../../middlewares/CheckBox';
import DropdownMenuQuartier from '../../../middlewares/dropdownMenu/DropdownMenuQuartiers';
import DropddownMenuDepartDestination from '../../../middlewares/dropdownMenu/DropdownMenuDepartDestination';
import DropddownMenuHeureMinute from '../../../middlewares/dropdownMenu/DropdownMenuHeureMinute';

export default function CreerNouvelAller(){

    const [prenom, setPrenom] = useState(); // Pour récupérer le prénom du membre pour qu'il apparaissent dans le model du trajet
    const [role, setRole] = useState(); // Pour récupérer le role du membre. Le champ nombre de place n'apparaitera que s'il est conducteur. Pas besoin d'un nombre de place disponible si l'on est que passager
    const [depart_data, setDepartData] = useState([]); // Pour le menu déroulant des départs
    const [depart, setDepart] = useState();
    const [departQuartierData, setDepartQuartierData] = useState([]); // Permet de récupérer les quartiers de depart pour le menu déroulant
    const [quartierDepartData, setQuartierDepartData] = useState();
    const [heures_de_depart, setHeuresDeDepart] = useState();
    const [heuresData, setHeuresData] = useState([]); // Pour le menu déroulant des heures
    const [minutes_de_depart, setMinutesDeDepart] = useState();
    const [minutesData, setMinutesData] = useState([]); // Pour me menu déroulant des minutes
    const [destination_data, setDestinationData] = useState([]); // Pour le menu déroulant des destinations
    const [destination, setDestination] = useState();
    const [destinationQuartierData, setDestinationQuartierData] = useState([]); // Permet de récupérer les quartiers  de destination pour le menu déroulant
    const [quartierDestinationData, setQuartierDestinationData] = useState();
    const [nombrePlaces_data, setNombreDePlacesData] = useState([]); // Pour le menu déroulant du nombres de places
    const [nombre_de_places, setNombreDePlaces] = useState();
    const [nouveauTrajet] = useState(true); // Permet d'utiliser la même route du back que lors de l'inscription. Cette donnée, envoyée en req.body permettra d'avoir des validations supplémentaires

    const [error, setError] = useState();
    const { id } = useParams();
    const history = useHistory();

    const [checkItems, setCheckedItems] = useState({}); //Checkbox
    
    const handleChange = (e) => {
        setCheckedItems({
            ...checkItems,
            [e.target.name]: e.target.checked
        });
    };

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

    const checkboxes = [ // On coupe en 2 pour que les checkboxs soient sur 2 lignes
        {
            name: "Lundi", 
            key: "Lundi",
            label: "Lundi"
        },
        {
            name: "Mardi", 
            key: "Mardi",
            label: "Mardi"
        },
        {
            name: "Mercredi", 
            key: "Mercredi",
            label: "Mercredi"
        },
        {
            name: "Jeudi", 
            key: "Jeudi",
            label: "Jeudi"
        },
    ];

    const checkboxesNext = [ // On coupe en 2 pour que les checkboxs soient sur 2 lignes
        {
            name: "Vendredi", 
            key: "Vendredi",
            label: "Vendredi"
        },
        {
            name: "Samedi", 
            key: "Samedi",
            label: "Samedi"
        },
        {
            name: "Dimanche", 
            key: "Dimanche",
            label: "Dimanche"
        },
    ];

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    // Permet de télécharger les quartiers qui correspondent au départ sélectionné
    useEffect(()=>{
        setDepartQuartierData(); // On remet en vide pour que le menu déroulant des quartiers disparaisse si jamais on passe sur un départ sans quartier
        async function fetchDepartQuartierData(){
            const departQuartierResult = await Requete.get(
                "/quartier/afficher-selon-depart/" + depart
            )
            setDepartQuartierData(departQuartierResult.data);
        }  
        fetchDepartQuartierData();

    }, [depart])

    // Permet de télécharger les quartiers qui correspondent à la destination sélectionnée
    useEffect(()=>{
        setDestinationQuartierData(); // On remet en vide pour que le menu déroulant des quartiers disparaisse si jamais on passe sur un départ sans quartier
        async function fetchDestinationQuartierData(){
            const destinationQuartierResult = await Requete.get(
                "/quartier/afficher-selon-destination/" + destination
            )
            setDestinationQuartierData(destinationQuartierResult.data);
        }  
        fetchDestinationQuartierData();

    }, [destination])

    useEffect(function(){ // Permet de récupérer les données du membre pour insérer dans le trajet son prénom et son _id. Cela rendra plus simple l'affichage du profil de la personne qui effectue le trajet

        async function fetchMembreData(){
            const membreResult = await Requete.get(
                '/membres/afficher/' + id,
                { headers: { "x-auth-token": token } },
            );
            setPrenom(membreResult.data[0].prenom);
            setRole(membreResult.data[0].role); //Si le rôle est différent de "Je suis passager exclusif", cette variable permettra de faire apparaître le champs du nombre de places disponibles
        };
        fetchMembreData();
    }, [id, token]);

    useEffect(function(){

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

    const submit = async function(e){
        e.preventDefault();

        try{
            const newAller = { checkItems, prenom, id, depart, quartierDepartData, heures_de_depart, minutes_de_depart, destination, quartierDestinationData, nombre_de_places, nouveauTrajet };
            await Requete.post(
                "/trajetsAller/creer/" + id,
                newAller,
                { headers : { "x-auth-token": token}},
            );
            history.push("/membre/" + id);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        };
    };

    return(
        <div className="col-md-12">
            <div className="card card-container">
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                <div className="card-body inside-card-body" style={{border: "3px solid #317681", backgroundColor: "#317681", textAlign: "center", color: "whitesmoke"}}>
                    <h4>Ajouter un ou plusieurs trajets aller:</h4>
                </div>
                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Quel(s) jour(s) faites-vous ce trajet ?</label>
                        <div className="form-check form-check-inline">
                            {checkboxes.map((item => (
                                <label className="checkbox-inline" key={item.key}>
                                    {item.name}
                                    <Checkbox
                                        name={item.name}
                                        checked={checkItems[item.name]}
                                        onChange={handleChange}
                                    />
                                </label>
                            )))}
                        </div>
                        <div className="form-check form-check-inline">
                            {checkboxesNext.map((item => (
                                <label key={item.key}>
                                    {item.name}
                                    <Checkbox
                                        name={item.name}
                                        checked={checkItems[item.name]}
                                        onChange={handleChange}
                                    />
                                </label>
                            )))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Vous partez de:</label>
                        <DropddownMenuDepartDestination
                            onChange={departChange}
                            donneesMap = {depart_data}
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
                            />
                        </div>
                        <label>h</label>
                        <div className="col-md-3">
                            <DropddownMenuHeureMinute
                                onChange={(e)=>setMinutesDeDepart(e.target.value)}
                                donneesMap = {minutesData}
                            />
                        </div>
                    </div>
                    <div className='form-group'>
                        <label>Vous allez à:</label>
                        <DropddownMenuDepartDestination
                            onChange={destinationChange}
                            donneesMap = {destination_data}
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
                            />
                            </div>
                        }
                        </div>
                    }
                    {role !== "Je suis passager exclusif" &&
                        <div className="form-group row col-md-12">
                            <label>Nombre de places disponibles:</label>
                            <div className="col-md-3">
                            <select
                                className="form-control"
                                onChange={(e)=>setNombreDePlaces(e.target.value)}
                            >
                                <option></option>
                                {nombrePlacesOptionItems}
                            </select>
                            </div>
                        </div>
                    }
                    <div className="form-group" style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                        <input
                            className="btn btn-primary"
                            type="submit"
                            value="Créer"
                        />
                    <h5><Link to={"/membre/" + id}>Retour</Link></h5>
                    </div>
                </form>
            </div>
        </div>
    )
}