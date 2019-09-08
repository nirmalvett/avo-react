interface Constant {
    readonly mathCode: string;
    readonly plainText: string;
    readonly LaTeX: string;
}
type ConstantsObj = {readonly [key: string]: Constant};

export const CONSTANTS: ConstantsObj = {
    true: {
        mathCode: '*T',
        plainText: 'true',
        LaTeX: '\\color{green}✔',
    },
    false: {
        mathCode: '*F',
        plainText: 'false',
        LaTeX: '\\color{red}✘',
    },
};

function remap(): {readonly [key: string]: string} {
    const remappedConstants: {[key: string]: string} = {};
    for (const c in CONSTANTS) {
        if (CONSTANTS.hasOwnProperty(c)) {
            remappedConstants[CONSTANTS[c].mathCode] = c;
        }
    }
    return remappedConstants;
}

export const REMAPPED_CONSTANTS = remap();
