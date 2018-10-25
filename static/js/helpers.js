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