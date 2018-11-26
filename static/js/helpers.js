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


function convertListFloatToAnalytics(inputList, topMark){
  // This method takes in a list of ints and the topMark then organizes the data by a group of 6 and outputs an object with the keys as the groups and the count

  const returnObj = {}; // we want {'0 to 2': 4, '2 to 4': 6, '4 to 6 (max)': 1}

  // STAGE 1: Find an Integer Increment Number
  // 9/6 = 1.5, we want to always go up so we want the increment number to be 2
  const dividedBy6 = topMark/6;
  let incrementNumber = dividedBy6;
  // If it's not a whole number then we truncate and add 1
  if (dividedBy6 % 1 !== 0){ incrementNumber = Math.floor(dividedBy6) + 1; }

  // Stage 2: We'll want our increment number to to be divisable by our top mark
  while (topMark % incrementNumber !== 0){ incrementNumber ++; }

  // Stage 3: We'll want to generate a list of increment Strings
  let trailingNumber = 0;
  while (trailingNumber !== topMark){ // increment by incrementNumber
    const lowerBound = trailingNumber;
    const upperBound = trailingNumber + incrementNumber;
    let keyString = `${lowerBound} to ${upperBound}`;
    // If it's the last one then we want to add 'max; at the end
    if (lowerBound === (topMark - incrementNumber)){ keyString += " (max)";};

    // Next we will want to go through our list of floats and get range [min, max)
    // For special cases for 0 and topMark where they are included in the first and last
    let countStudentsInGroup = 0;
    // CASE 1: The lower bound is 0 then filter by [min, max)
    if (lowerBound === 0){
      returnObj[keyString] = inputList.filter(x => x >= 0 && x < upperBound).length;
    }
    // CASE 2: The upper bound is topMark then filter by [min, max]
    else if (upperBound === topMark){
      returnObj[keyString] = inputList.filter(x => x >= lowerBound && x <= upperBound).length;
    }
    // CASE 3: Otherwise filter by [min, max)
    else {
        returnObj[keyString] = inputList.filter(x => x >= lowerBound && x < upperBound).length;
    }

    trailingNumber = upperBound;
  }

  return returnObj;
}
