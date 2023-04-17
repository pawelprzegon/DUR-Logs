function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

export function uniqueSortedList(data, label){
    let units = []
    data.forEach(element => {
        units.push(element.name)
    });

    let unique = units.filter(onlyUnique);
    if(label == 'Mutoh'){
        unique.sort();
        unique.reverse();
    }
    return unique
}