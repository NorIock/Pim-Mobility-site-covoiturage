
const MyArraySortByDayOfWeek = function(toSort){

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
        let jour1 = a.toLowerCase();
        let jour2 = b.toLowerCase();
        return sorter[jour1] - sorter[jour2];
    });
};

module.exports = MyArraySortByDayOfWeek;