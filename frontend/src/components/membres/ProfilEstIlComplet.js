import React, {useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';

import Requete from '../../middlewares/Requete';

export default function LeProfilEstIlComplet(){
    
    const [data, setData] = useState([]);
    const { id } = useParams();
    const history = useHistory();

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(function(){

        async function fetchData(){
            const result = await Requete.get(
                '/membres/completer-compte-si-besoin/' + id,
            );
            setData(result.data);
            if((result.data.role !== undefined 
                && result.data.trajets_aller.length !== 0 
                && result.data.trajets_retour.length !== 0)
                || result.data.admin === true){

                history.push("/");
            }
        };
        fetchData();
    }, [id, history]);

    return(
        <div>
        {data.length === 0 ? (
            <p>Chargement des données</p>
        ) : (
        <div className="warning-profil-not-complete">

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
        )}
        </div>
    )
}