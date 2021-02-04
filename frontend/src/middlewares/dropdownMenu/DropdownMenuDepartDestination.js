import React from 'react';

const DropddownMenuDepartDestination = ({ onChange, donneesMap, valeurDefaut }) => {

    // donneesMap est ce que l'on récupère (les diférents champs du dropdown que l'on souhaite mapper)
    let optionItems = donneesMap.map((donnee => 
        <option key={donnee.nom} value={donnee.nom}>{donnee.nom}</option>
    ));

    return (
        <select 
            className="form-control"
            onChange={onChange}
            defaultValue={valeurDefaut}
        >
            <option>------------------</option>
            {optionItems}
        </select>

    )
};

export default DropddownMenuDepartDestination;
