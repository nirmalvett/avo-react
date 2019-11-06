export function uniqueKey(): string {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return Math.random()
        .toString(36)
        .substr(2, 9);
}

export function isChrome(): boolean {
    // please note,
    // that IE11 now returns undefined again for window.chrome
    // and new Opera 30 outputs true for window.chrome
    // but needs to check if window.opr is not undefined
    // and new IE Edge outputs to true now for window.chrome
    // and if not iOS Chrome check
    // so use the below updated condition
    const winNav = window.navigator;
    const isIOSChrome = winNav.userAgent.match('CriOS');
    // @ts-ignore
    const isChromium = window.chrome !== null && window.chrome !== undefined;
    const isHeadlessChrome = window.navigator.userAgent.indexOf('HeadlessChrome') !== -1;
    // @ts-ignore
    const isOpera = window.opr !== undefined;
    const isEdge = winNav.userAgent.indexOf('Edge') > -1;

    if (isIOSChrome) {
        return true;
    } else if (isChromium || isHeadlessChrome) {
        return winNav.vendor === 'Google Inc.' && !isOpera && !isEdge;
    } else {
        return false;
    }
}

export function isSafari(): boolean {
    // @ts-ignore
    return window.safari !== undefined;
}

export function convertListFloatToAnalytics(
    inputList: number[],
    topMark: number,
): {[key: string]: number} {
    // This method takes in a list of ints and the topMark then organizes the data by a group of 6 and outputs an
    // object with the keys as the groups and the count
    // we want {'0 to 2': 4, '2 to 4': 6, '4 to 6 (max)': 1}
    const returnObj: {[key: string]: number} = {};
    if (topMark === 0 || inputList.length === 0) {
        return returnObj; // if topMark is 0 then we should just return the object
    }
    // STAGE 1: Find an Integer Increment Number
    // 9/6 = 1.5, we want to always go up so we want the increment number to be 2
    const dividedBy6 = topMark / 6;
    let incrementNumber = dividedBy6;
    // If it's not a whole number then we truncate and add 1
    if (dividedBy6 % 1 !== 0) incrementNumber = Math.floor(dividedBy6) + 1;

    // Stage 3: We'll want to generate a list of increment Strings
    let trailingNumber = 0;
    const topMarkEven = topMark % 2 === 0;
    // this will change if say we're at 24 and the increment is 6 while the topMark is 29
    let lastKeyString = `${topMark} (max)`;
    let lowerBoundSpecial = -1; // not needed unless it's a special case

    let continueLooping = true;
    while (continueLooping) {
        // increment by incrementNumber
        const lowerBound = trailingNumber;
        const upperBound = trailingNumber + incrementNumber;
        let keyString =
            incrementNumber === 1
                ? `${lowerBound}` // if it's increasing by one then just show the number
                : `${lowerBound} to ${upperBound}`; // otherwise show a range i.e. 2 to 4

        // Next we will want to go through our list of floats and get range [min, max)
        returnObj[keyString] = inputList.filter(x => x >= lowerBound && x < upperBound).length;

        trailingNumber = upperBound;
        if (topMarkEven) {
            // In this case we want to go all the way to the end
            if (trailingNumber + incrementNumber > topMark) {
                continueLooping = false;
                // at this point we might be at 24, increment 6, but top mark is 29
                lastKeyString =
                    trailingNumber === topMark
                        ? `${topMark} (max)`
                        : `${trailingNumber} to ${topMark} (max)`;
                lowerBoundSpecial = trailingNumber; // not needed unless it's a special case
            } else {
                continueLooping = trailingNumber <= topMark;
            }
        } else {
            // in this case we can go one before the end
            if (trailingNumber + incrementNumber > topMark) {
                continueLooping = false;
                // at this point we might be at 24, increment 6, but top mark is 29
                lastKeyString =
                    trailingNumber === topMark
                        ? `${topMark} (max)`
                        : `${trailingNumber} to ${topMark} (max)`;
                lowerBoundSpecial = trailingNumber; // not needed unless it's a special case
            } else {
                continueLooping = trailingNumber <= topMark - 1;
            }
        }
    }

    // We need to get the last grouping
    returnObj[lastKeyString] =
        lowerBoundSpecial !== -1
            ? inputList.filter(x => x === topMark).length
            : inputList.filter(x => x >= lowerBoundSpecial && x <= topMark).length;

    return returnObj;
}
