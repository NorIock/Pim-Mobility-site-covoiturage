import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import ErrorNotice from '../../misc/ErrorNotice';
import Requete from '../../../middlewares/Requete';

export default function CreerAdmin(){

    const [nom, setNom]= useState(); // Mettre une valeur dans les parenthèse de useState donne une valeur par défaut
    const [prenom, setPrenom]= useState();
    const [email, setEmail]= useState();
    const [mot_de_passe, setMotDePasse]= useState();
    const [mot_de_passe_confirmation, setMotDePasseConfirmation]= useState();
    const [telephone, setTelephone]= useState();
    const [error, setError] = useState();

    const history = useHistory();

    let token = localStorage.getItem('auth-token');
    if(token === null){
        localStorage.setItem('auth-token', "");
        token= "";
    }

    const submit = async function(e){
        e.preventDefault();

        try {
            const newAdmin = { nom, prenom, email, mot_de_passe, mot_de_passe_confirmation, telephone, admin: true };
            await Requete.post(
                "/membres/admin/creer",
                newAdmin,
                { headers: { "x-auth-token": token } }
                );
            history.push("/admin/admins/afficher-tous");
            
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
                            placeholder='Nom'
                            onChange={(e) => setNom(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Prénom:<span style={{color: "red"}}>*</span></label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Prénom'
                            onChange={(e) => setPrenom(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:<span style={{color: "red"}}>*</span></label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Email'
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
                        <input type='submit' value='Ajouter un administrateur' className='btn btn-primary'/>
                    </div>
                </form>
            </div>
        </div>
    )
}