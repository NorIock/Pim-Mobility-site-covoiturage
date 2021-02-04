import React, { useState, useEffect } from 'react';
import Requete from '../../../../../middlewares/Requete';

export default function StatistiqueDemandesAnnulees(){

    const [data, setData] = useState([]);
    const [noData, setNodata] = useState(false);

    let token;
    token = localStorage.getItem('auth-token', token);
    if(token === null){
        localStorage.setItem('auth-token', "");
        token = "";
    }

    useEffect(()=>{
        async function fetchData(){
            const result = await Requete.get(
                "/covoiturageDemande/admin/afficher/annulees",
                { headers: { "x-auth-token": token } },
            )
            if(result.data === "Queud"){
                setNodata(true);
            }
            setData(result.data)
        }
        fetchData()
    }, [token])

    return(
        <div>
            {data.length === 0 ? (
                <p>Chargement...</p>
            ) : 
            noData === true ? (
                <p>0</p>
            ) :
            data.length
            }
        </div>
    )
}