import React from 'react';

const DropddownMenuHeureMinute = ({ onChange, donneesMap, valeurDefaut }) => {

    // donneesMap est ce que l'on récupère (les diférents champs du dropdown que l'on souhaite mapper)
    let optionItems = donneesMap.map((donnee => 
        <option key={donnee.chiffre} value={donnee.chiffre}>{donnee.chiffre}</option>
    ));

    return (
        <select 
            className="form-control"
            onChange={onChange}
            defaultValue={valeurDefaut}
        >
            <option></option>
            {optionItems}
        </select>

    )
};

export default DropddownMenuHeureMinute;
