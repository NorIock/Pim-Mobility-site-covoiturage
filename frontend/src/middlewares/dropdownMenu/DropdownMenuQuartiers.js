import React from 'react';

const DropdownMenuQuartier = ({ onChange, donneesMap, valeurDefaut }) => {

    // donneesMap est ce que l'on récupère (les diférents champs du dropdown que l'on souhaite mapper)
    let optionItems = donneesMap.map((donnee => 
        <option key={donnee.nom_quartier} value={donnee.nom_quartier}>{donnee.nom_quartier}</option>
    ));

    return (
        <select 
            className="form-control"
            onChange={onChange}
            defaultValue={valeurDefaut}
        >
            <option>Plus précisémment</option>
            {optionItems}
        </select>

    )
};

export default DropdownMenuQuartier;
