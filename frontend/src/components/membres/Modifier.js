import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';

import ErrorNotice from '../misc/ErrorNotice';
import Requete from '../../middlewares/Requete';
import axios from 'axios';

export default function ModifierMembre(){

    const [nom]= useState(); // Mettre une valeur dans les parenthèse de useState donne une valeur par défaut
    const [prenom]= useState();
    const [email, setEmail]= useState();
    const [mot_de_passe, setMotDePasse]= useState();
    const [mot_de_passe_confirmation, setMotDePasseConfirmation]= useState();
    const [telephone, setTelephone]= useState();
    const [commune_entreprise_data, setCommuneEntrepriseData] = useState([]);
    const [commune_entreprise, setCommuneEntreprise] = useState();
    const [error, setError] = useState();
    const [data, setData] = useState([]); // Pour le menu déroulant commune entreprise
    const [roleData, setRoleData] = useState([]); // Pour le menu déroulant role
    const [role, setRole] = useState();
    const [modePaiementData, setModePaiementData] = useState([]); // Pour le menu déroulant mode de paiement
    const [mode_paiement, setModePaiement] = useState();

    const history = useHistory();
    const { id } = useParams();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    // J'ai eu l'erreur: This is a no-op, but it indicates a memory leak in your application. To fix, cancel 
    // all subscriptions and asynchronous tasks in a useEffect cleanup function. 
    // Semble être résolu par: https://codesandbox.io/s/l458746w89?from-embed=&file=/src/AxiosHooksComponent.js
    // Montre aussi comment décaler le render pour que les données soient récupérées
    useEffect(() => {

        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const fetchData = () => {
            try{
                Requete.get(
                    '/membres/afficher/' + id,
                    { headers: { "x-auth-token": token }, cancelToken: source.token},
                ).then(data => {setData(data.data)});
            } catch(error){
                if(axios.isCancel(error)) {
                    console.log("Cancelled");
                } else {
                    throw error;
                }
            }
        };
        fetchData();
        return () => {
            source.cancel();
        };
    }, [id, token])

    useEffect(function(){

        async function fetchCommuneEntrepriseData(){
            const result = await Requete.get(
                '/communesEntreprises/afficher',
            )
            setCommuneEntrepriseData(result.data);
        };
        fetchCommuneEntrepriseData();

        async function fetchRoleData(){ // Pour le menu déroulant des types passager/conducteur
            const roleResult = await Requete.get(
                "/conducteursPassagers/afficher"
            );
            setRoleData(roleResult.data);
        };
        fetchRoleData();

        async function fetchModePaiementData(){ // Pour le menu déroulant des moyens de paiement
            const modePaiementResult = await Requete.get(
                "/modesPaiement/afficher"
            );
            setModePaiementData(modePaiementResult.data);
        };
        fetchModePaiementData();
    }, []);

    let optionItems = commune_entreprise_data.map((commune => 
        <option key={commune.nom} value={commune.nom}>{commune.nom}</option>
    ));

    let roleOptionItems = roleData.map((roles =>
        <option key={roles.type} value={roles.type}>{roles.type}</option>
    ));

    let modePaiementOptionItems = modePaiementData.map((modesPaiement =>
        <option key={modesPaiement.type} value={modesPaiement.type}>{modesPaiement.type}</option>
    ));

    const submit = async function(e){
        e.preventDefault();

        try{
            const majMembre = { nom, prenom, email, mot_de_passe, mot_de_passe_confirmation, telephone, commune_entreprise, role, mode_paiement };
            await Requete.put(
                "/membres/maj/" + id,
                majMembre,
                { headers: { "x-auth-token": token } },
            );
            history.push("/membre/" + id);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div>
            {data.length === 0 ? (
                <p>Chargement des données</p>
            ) : (

            <div className="col-md-12">
                <div className="card card-container">
                    <img
                        src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                        alt="profile-img"
                        className="profile-img-card"
                    />
                    {error && (
                        <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                    )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                    <h4>{data[0].nom} {data[0].prenom}</h4>
                    <form onSubmit={submit}>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                defaultValue={data[0].email}
                                type='text'
                                className='form-control'
                                placeholder={data[0].email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Mot de passe:</label>
                            <input
                                type='password'
                                className='form-control'
                                placeholder='Changer le mot de passe'
                                onChange={(e) => setMotDePasse(e.target.value)}
                            />
                        </div>
                        <div className='form-group'>
                            {/* <label>Confirmation de votre mot de passe:</label> */}
                            <input
                                type='password'
                                className='form-control'
                                placeholder='Confirmez votre mot de passe'
                                onChange={(e) => setMotDePasseConfirmation(e.target.value)}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Téléphone:</label>
                            <input
                                defaultValue={data[0].telephone}
                                className='form-control'
                                type='tel'
                                pattern='[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}'
                                placeholder={data[0].telephone}
                                onChange={(e) => setTelephone(e.target.value)}
                            />
                        </div>
                        <div className='form-group'>
                            <label>Dans quelle commune travaillez-vous ?</label>
                            <select 
                                className='form-control'
                                defaultValue={data[0].commune_entreprise}
                                onChange={(e) => setCommuneEntreprise(e.target.value)}               
                            >
                                {optionItems}
                            </select>
                        </div>
                        <div className='form-group'>
                            <label>Conducteur, passager ou les deux ?</label>
                            <select
                                className='form-control'
                                defaultValue={data[0].role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option></option>
                                {roleOptionItems}
                            </select>
                        </div>
                        {(role !== "Je suis passager exclusif") && 
                            <div className='form-group'>
                                <label>Quel moyen d'échange monétaire préférez-vous ?</label>
                                <select
                                    className='form-control'
                                    defaultValue={data[0].mode_paiement}
                                    onChange={(e) => setModePaiement(e.target.value)}
                                    >
                                    <option></option>
                                    {modePaiementOptionItems}
                                </select>
                            </div>
                        }
                        <div className='form-group'>
                            <input type='submit' value='Modifier' className='btn btn-primary'/>
                            <p><Link to={"/membre/" + id}>Revenir à mon profil</Link></p>
                        </div>
                    </form>
                </div>
            </div>
            )}
        </div>
    )
}