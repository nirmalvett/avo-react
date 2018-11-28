import React from 'react';
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

export function uniqueKey(){
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
}

export function objectSize(obj){
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

export const notChromeMessage = "We have detected that you are currently not using Google Chrome.\n" +
             "This is not recommended as AVO has not been properly tested and many of the basic functionality may not work.\n\n" +
             "Some known issues include:\n" +
             "- Teacher accounts are unable to properly set the test date deadline.\n" +
             "- Scrolling does not work properly.\n" +
             "- Latex rendering issues causing things to look misaligned.\n\n" +
             "Many of these issues are caused by bugs found in non Chrome browsers which are out AvocadoCore's control. " +
             "We will continue to look for solutions, but we strongly advise using Chrome.";

export function isChrome(){
      // please note,
      // that IE11 now returns undefined again for window.chrome
      // and new Opera 30 outputs true for window.chrome
      // but needs to check if window.opr is not undefined
      // and new IE Edge outputs to true now for window.chrome
      // and if not iOS Chrome check
      // so use the below updated condition
      var isChromium = window.chrome;
      var winNav = window.navigator;
      var vendorName = winNav.vendor;
      var isOpera = typeof window.opr !== "undefined";
      var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
      var isIOSChrome = winNav.userAgent.match("CriOS");

      if (isIOSChrome) {
         return true;
      } else if(
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        isOpera === false &&
        isIEedge === false) {
         return true;
      } else {
        return false;
      }

    }


export function convertListFloatToAnalytics(inputList, topMark){
  // This method takes in a list of ints and the topMark then organizes the data by a group of 6 and outputs an object with the keys as the groups and the count
  const studentSizeWhoTookIt = inputList.length;
  const returnObj = {
    studentSizeWhoTookIt: studentSizeWhoTookIt
  }; // we want {'0 to 2': 4, '2 to 4': 6, '4 to 6 (max)': 1}
  if (topMark === 0){ return returnObj; } // if topMark is 0 then we should just return the object
  // STAGE 1: Find an Integer Increment Number
  // 9/6 = 1.5, we want to always go up so we want the increment number to be 2
  const dividedBy6 = topMark/6;
  let incrementNumber = dividedBy6;
  // If it's not a whole number then we truncate and add 1
  if (dividedBy6 % 1 !== 0){ incrementNumber = Math.floor(dividedBy6) + 1; }

  // Stage 3: We'll want to generate a list of increment Strings
  let trailingNumber = 0;
  const topMarkEven = topMark % 2 === 0;
  // this will change if say we're at 24 and the increment is 6 while the topMark is 29
  let lastKeyString = `${topMark} (max)`;
  let lowerBoundSpecial = -1; // not needed unless it's a special case

  let continueLooping = true;
  while (continueLooping){ // increment by incrementNumber
    const lowerBound = trailingNumber;
    const upperBound = trailingNumber + incrementNumber;
    let keyString = incrementNumber === 1
        ?`${lowerBound}` // if it's increasing by one then just show the number
        : `${lowerBound} to ${upperBound}`; // otherwise show a range i.e. 2 to 4

    // Next we will want to go through our list of floats and get range [min, max)
      const numberInGroup = inputList.filter(x => x >= lowerBound && x < upperBound).length;
      returnObj[keyString] = {
        numberOfStudents: numberInGroup,
        percentOfStudent: (numberInGroup/studentSizeWhoTookIt) * 100,
      };


    trailingNumber = upperBound;
    if (topMarkEven){ // In this case we want to go all the way to the end
      if (trailingNumber + incrementNumber > topMark){
        continueLooping = false;
        // at this point we might be at 24, increment 6, but top mark is 29
          lastKeyString = trailingNumber === topMark
              ? `${topMark} (max)`
              : `${trailingNumber} to ${topMark} (max)`;
          lowerBoundSpecial = trailingNumber; // not needed unless it's a special case
      }
      else {
        continueLooping = trailingNumber <= topMark;
      }

    }
    else { // in this case we can go one before the end
     if (trailingNumber + incrementNumber > topMark){
        continueLooping = false;
        // at this point we might be at 24, increment 6, but top mark is 29
          lastKeyString = trailingNumber === topMark
              ? `${topMark} (max)`
              : `${trailingNumber} to ${topMark} (max)`;
          lowerBoundSpecial = trailingNumber; // not needed unless it's a special case
      }
      else {
        continueLooping = trailingNumber <= topMark - 1;
      }
    }
  }


  // We need to get the last grouping
  const numberInGroup =
      lowerBoundSpecial !== -1
          ? inputList.filter(x => x === topMark).length
          : inputList.filter(x => x >= lowerBoundSpecial && x <= topMark).length;
  returnObj[lastKeyString] = {
    numberOfStudents: numberInGroup,
    perfectOfStudent: (numberInGroup/studentSizeWhoTookIt) * 100,
  };


  return returnObj;
}
