interface PostfixOperator {
    readonly type: 'postfix';
    readonly priority: number;
    readonly mathCode: string;
    readonly plainText: string;
    readonly LaTeX: string;
    readonly ptOp1: number;
    readonly ptOut: number;
    readonly texOp1: number;
    readonly texOut: number;
}

export const POSTFIX_OPERATORS: {readonly [key: string]: PostfixOperator} = {
    is_vector: {
        type: 'postfix',
        priority: 3,
        mathCode: 'EA',
        plainText: 'is vector',
        LaTeX: '&0 \\text{ is vector}',
        ptOut: 3,
        texOut: 3,
        ptOp1: 4,
        texOp1: 4,
    },
    '^T': {
        type: 'postfix',
        priority: 6,
        mathCode: 'FC',
        plainText: '^T',
        LaTeX: '&0 ^\\text{T}',
        ptOut: 6,
        texOut: 6,
        ptOp1: 8,
        texOp1: 8,
    },
    is_normal: {
        type: 'postfix',
        priority: 3,
        mathCode: 'GC',
        plainText: 'is normal',
        LaTeX: '&0 \\text{ is normal}',
        ptOut: 3,
        texOut: 3,
        ptOp1: 4,
        texOp1: 4,
    },
    is_orthogonal: {
        type: 'postfix',
        priority: 3,
        mathCode: 'GD',
        plainText: 'is orthogonal',
        LaTeX: '&0 \\text{ is orthogonal}',
        ptOut: 3,
        texOut: 3,
        ptOp1: 4,
        texOp1: 4,
    },
};

function remap(): {readonly [key: string]: string} {
    const remappedPostfixOperators: {[key: string]: string} = {};
    for (let c in POSTFIX_OPERATORS) {
        if (POSTFIX_OPERATORS.hasOwnProperty(c)) {
            remappedPostfixOperators[POSTFIX_OPERATORS[c].mathCode] = c;
        }
    }
    return remappedPostfixOperators;
}

export const REMAPPED_POSTFIX_OPERATORS = remap();
