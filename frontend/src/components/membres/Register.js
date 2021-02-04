import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import UserContext from '../../context/UserContext';
import ErrorNotice from '../misc/ErrorNotice';
import Requete from '../../middlewares/Requete';

export default function Register(){

    const [nom, setNom]= useState(); // Mettre une valeur dans les parenthèse de useState donne une valeur par défaut
    const [prenom, setPrenom]= useState();
    const [email, setEmail]= useState();
    const [mot_de_passe, setMotDePasse]= useState();
    const [mot_de_passe_confirmation, setMotDePasseConfirmation]= useState();
    const [telephone, setTelephone]= useState();
    const [commune_entreprise, setCommuneEntreprise] = useState();
    const [error, setError] = useState();
    const [data, setData] = useState([]);

    const { setUserData } = useContext(UserContext);
    const history = useHistory();

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                '/communesEntreprises/afficher',
            )
            setData(result.data);
        };
        fetchData();
    }, []);

    let optionItems = data.map((commune => 
        <option key={commune.nom} value={commune.nom}>{commune.nom}</option>
    ));


    const submit = async function(e){
        e.preventDefault();

        try {
            const newMembre = { nom, prenom, email, mot_de_passe, mot_de_passe_confirmation, telephone, commune_entreprise };
            await Requete.post(
                "/membres/inscription",
                newMembre,
                );
            const loginRes = await Requete.post( // On fait directement la connexion pour pouvoir récupérer le token
                "/membres/connexion",
                {
                    email,
                    mot_de_passe,
                }
            );
            setUserData({
                token: loginRes.data.token,
                membre: loginRes.data.membre,
            });
            localStorage.setItem("auth-token", loginRes.data.token);
            history.push("/inscription/part2/" + loginRes.data.membre.id);
            
        } catch(err) {
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
            
        }
    };

    return(
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
                <form onSubmit={submit}>
                    <div className="form-group">
                        <label>Nom:<span style={{color: "red"}}>*</span></label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Votre nom'
                            onChange={(e) => setNom(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Prénom:<span style={{color: "red"}}>*</span></label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Votre prénom'
                            onChange={(e) => setPrenom(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:<span style={{color: "red"}}>*</span></label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Votre email'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Mot de passe:<span style={{color: "red"}}>*</span></label>
                        <input
                            type='password'
                            className='form-control'
                            placeholder='Mot de passe'
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
                        <label>Téléphone:<span style={{color: "red"}}>*</span></label>
                        <input
                            className='form-control'
                            type='tel'
                            pattern='[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{2}'
                            onChange={(e) => setTelephone(e.target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Dans quelle commune travaillez-vous ?</label>
                        <select 
                            className='form-control'
                            // value={this.state.commune}
                            onChange={(e) => setCommuneEntreprise(e.target.value)}               
                        >
                            <option>Aucune</option>
                            {optionItems}
                        </select>
                    </div>
                    <div className='form-group'>
                        <input type='submit' value='Inscription' className='btn btn-primary'/>
                    </div>
                </form>
            </div>
        </div>
    )
}