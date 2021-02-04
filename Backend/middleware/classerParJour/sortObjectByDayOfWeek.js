// Pour cette fonction, le nom du champ du model doit être jour
const MyObjectSortByDayOfWeek = function(toSort){

    // On fixe les priorités de chaques jours pour que les résultats sortent dans l'odre des jours de la semaine
    const sorter = {
        "lundi": 0,
        "mardi": 1,
        "mercredi": 2,
        "jeudi": 3,
        "vendredi": 4,
        "samedi": 5,
        "dimanche": 6
    };
    
    // On trie par jour. la constante sorter permet de fixer les priorités de chaque jours
    toSort.sort(function sortByDay(a, b) {
        let jour1 = a.jour.toLowerCase();
        let jour2 = b.jour.toLowerCase();
        return sorter[jour1] - sorter[jour2];
    });
};

module.exports = MyObjectSortByDayOfWeek;