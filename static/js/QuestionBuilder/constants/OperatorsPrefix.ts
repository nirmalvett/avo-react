interface PrefixOperator {
    readonly type: 'prefix';
    readonly priority: number;
    readonly mathCode: string;
    readonly plainText: string;
    readonly LaTeX: string;
    readonly ptOp2: number;
    readonly ptOut: number;
    readonly texOp2: number;
    readonly texOut: number;
}

export const PREFIX_OPERATORS: {readonly [key: string]: PrefixOperator} = {
    not: {
        type: 'prefix',
        priority: 2,
        mathCode: 'BC',
        plainText: 'not',
        LaTeX: '\\text{not } &0',
        ptOut: 2,
        texOut: 2,
        ptOp2: 2,
        texOp2: 2,
    },
    '---': {
        type: 'prefix',
        priority: 7,
        mathCode: 'CA',
        plainText: '-',
        LaTeX: '- &0',
        ptOut: 5,
        texOut: 5,
        ptOp2: 5,
        texOp2: 5,
    },
    '--': {
        type: 'prefix',
        priority: 5,
        mathCode: 'CA',
        plainText: '-',
        LaTeX: '- &0',
        ptOut: 5,
        texOut: 5,
        ptOp2: 5,
        texOp2: 5,
    },
};

function remap(): {readonly [key: string]: string} {
    const remappedPrefixOperators: {[key: string]: string} = {};
    for (let c in PREFIX_OPERATORS) {
        if (PREFIX_OPERATORS.hasOwnProperty(c)) {
            remappedPrefixOperators[PREFIX_OPERATORS[c].mathCode] = c;
        }
    }
    return remappedPrefixOperators;
}

export const REMAPPED_PREFIX_OPERATORS = remap();
