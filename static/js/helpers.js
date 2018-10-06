  export function removeDuplicateClasses(classList){
    /* Sorts by id so that the same class is not duplicated*/
    let keysAlreadyFound = [];
    let noDuplicateList = [];
    for (let i = 0; i < classList.length; i++){
        const id = classList[i].id;
        if (keysAlreadyFound.indexOf(id) === -1){
            keysAlreadyFound.push(id);
            noDuplicateList.push(classList[i]);
        }
    }
    return noDuplicateList;
    }