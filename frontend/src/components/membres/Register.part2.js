import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import ErrorNotice from '../misc/ErrorNotice';
import Requete from '../../middlewares/Requete';

export default function RegisterPart2(){

    const [mode_paiement, setModePaiement] = useState();
    const [role, setRole] = useState("Je suis passager exclusif"); // "Je suis passager exclusif" est la valeur par défault de role
    const [roleData, setRoleData] = useState([]);
    const [modePaiementData, setModePaiementData] = useState([]);
    
    const [error, setError] = useState();
    const { id } = useParams();
    const history = useHistory();

    let token = localStorage.getItem('auth-token');
    if(token === null){
        localStorage.setItem('auth-token', "");
        token= "";
    }

    useEffect(()=>{

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
    
    let roleOptionItems = roleData.map((roles =>
        <option key={roles.type} value={roles.type}>{roles.type}</option>
    ));

    let modePaiementOptionItems = modePaiementData.map((modesPaiement =>
        <option key={modesPaiement.type} value={modesPaiement.type}>{modesPaiement.type}</option>
    ));

    const submit = async function(e){
        e.preventDefault();

        try{
            const moreDataMembre = { mode_paiement, role };
            await Requete.post(
                "/membres/inscription/part2/" + id,
                moreDataMembre,
                { headers: { "x-auth-token": token } }
            );
            history.push("/aller/creer/" + id);
        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }

    };

    return(
        <div className="col-md-12">
            <div className="card card-container">
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                <form onSubmit={submit}>
                    <div className='form-group'>
                        <label>Conducteur, passager ou les deux ?</label>
                        <select
                            className='form-control'
                            onChange={(e) => setRole(e.target.value)}
                            // defaultValue="Je suis passager exclusif"
                        >
                            <option></option>
                            {roleOptionItems}
                        </select>
                    </div>
                    {role !== "Je suis passager exclusif" && 
                        <div className='form-group'>
                            <label>Quel moyen d'échange monétaire préférez-vous ?</label>
                            <select
                                className='form-control'
                                onChange={(e) => setModePaiement(e.target.value)}
                                >
                                <option></option>
                                {modePaiementOptionItems}
                            </select>
                        </div>
                    }
                    <div className='form-group'>
                        <input type="submit" value="Suivant" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        </div>
    )
}