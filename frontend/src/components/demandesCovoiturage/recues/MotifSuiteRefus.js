import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Requete from '../../../middlewares/Requete';
import ErrorNotice from '../../misc/ErrorNotice';

export default function MotifSuiteRefusDemandeDeCovoiturage(){

    const [motifsRefusData, setMotifsRefusData] = useState([]);
    const [motifsRefus, setMotifsRefus] = useState();
    const [motifsPersonnalise, setMotifsPersonnalise] = useState();
    const [error, setError] = useState();
    const { id, aller_ou_retour, nbre_refus } = useParams();
    const history = useHistory();

    let token = localStorage.getItem("auth-token");
    if(token === null){
        localStorage.setItem("auth-token", "");
        token = "";
    }

    useEffect(()=> {

        async function fetchData(){
            const motifsResult = await Requete.get(
                '/motifsRefusDemandeDeCovoiturage/afficher',
            )
            setMotifsRefusData(motifsResult.data);
        }
        fetchData();
    }, []);

    let motifOptionItems = motifsRefusData.map((motifRefus =>
        <option key={motifRefus.motif} value={motifRefus.motif}>{motifRefus.motif}</option>
        ));

    const submitOui = async function(e){
        e.preventDefault();

        try{
            const unMotif = { id, aller_ou_retour, nbre_refus, motifsRefus, motifsPersonnalise}

            await Requete.post(
                "/covoiturageDemande/motif-refus/oui",
                unMotif,
                { headers: { "x-auth-token": token } },
            )
            history.push("/demandesCovoiturages/recues/" + id + "/" + aller_ou_retour);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    const submitNon = async function(e){
        e.preventDefault();

        try{
            const pasDeMotif = { id, nbre_refus };

            await Requete.post(
                "/covoiturageDemande/motif-refus/non",
                pasDeMotif,
                { headers: { "x-auth-token": token } },
            )
            history.push("/demandesCovoiturages/recues/" + id + "/" + aller_ou_retour);

        } catch(err){
            err.response.data.msg && setError(err.response.data.msg); //Les 2 doivent être vrai pour être executés. Si le premier est vrai, le setState s'executera pour stocker le message d'erreur
        }
    }

    return(
        <div>
            <h3 style={{marginTop: "80px", textAlign: "center"}}>Voulez-vous ajouter un motif pour la (les) demande(s) refusée(s) ?</h3>
            <div className="container" style={{ border: "2px solid #317681"}}>
                <div>
                    <label>Selectionnez votre motif:</label>
                    <select
                        className='form-control'
                        onChange={(e) => setMotifsRefus(e.target.value)}
                    >
                        <option></option>
                        {motifOptionItems}
                        <option>autre</option>
                    </select>
                </div>
                {motifsRefus === "autre" &&
                <div className='form-group'>
                    <label>Motif:</label>
                    <input
                        type='text'
                        className='form-control'
                        placeholder='Quel est votre motif ?'
                        onChange={(e) => setMotifsPersonnalise(e.target.value)}
                    />
                </div>
                }
                {error && (
                    <ErrorNotice message={error} clearError={()=> setError(undefined)} />
                )} {/*S'il y a une erreur, affiche le message d'erreur, la faction anonyme supprime quand on clique */}
                {/* <div className="demandes-covoiturages-recues-boutons"> */}
                <br></br>
                <div>
                    <input
                        type='submit'
                        value='Valider mon motif'
                        className='btn btn-primary'
                        onClick={submitOui}
                    />
                    <input
                        type='submit'
                        value='Pas de motif'
                        className='btn btn-danger float-right'
                        onClick={submitNon}
                    />
                    <p></p>
                </div>
            </div>
        </div>
    )
}