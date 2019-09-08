function range(number: number) {
    return Array(number)
        .fill(0)
        .map((_, x) => x);
}

interface Function {
    readonly mathCode: string;
    readonly plainText: string;
    readonly LaTeX: string;
    readonly args: string;
    readonly argCount: number;
}

type FunctionsObj = {readonly [key: string]: Function};

function build(): FunctionsObj {
    const rawFunctions: {[key: string]: [string, null | string, null | string, string]} = {
        boolean: ['AA', null, null, ''],
        number: ['AB', null, null, 'min, max, zeroes/mod=0'],
        matrix: ['AC', null, null, 'min, max, zeroes/mod=0, rows, cols=1'],
        code_vector: ['AD', null, null, 'check vector'],
        matrix_rank: [
            'AE',
            null,
            null,
            'dimension, rank, seed=-1, row=-1, column=-1, negative=-1, transpose=-1',
        ],
        matrix_eigen: ['AF', null, null, 'dimension, seed=-1, row=-1'],
        matrix_rank_mod5: [
            'AH',
            null,
            null,
            'dimension, rank, seed=-1, row=-1, column=-1, transpose=-1',
        ],
        basis: ['AI', null, null, 'size, seed=-1, row=-1, column=-1, negative=-1'],
        sqrt: ['DA', null, '\\sqrt{&0}', 'n'],
        sin: ['DB', null, null, 'n'],
        cos: ['DC', null, null, 'n'],
        tan: ['DD', null, null, 'n'],
        arcsin: ['DE', null, null, 'n'],
        arccos: ['DF', null, null, 'n'],
        arctan: ['DG', null, null, 'n'],
        rot: ['DH', null, null, 'n'],
        ref: ['DI', null, null, 'n'],
        norm: ['ED', null, null, 'v'],
        angle: ['EE', null, null, 'u, v'],
        proj: ['EF', null, '\\text{proj}_{&0}\\left(&1\\right)', 'u, v'],
        get: ['FD', null, null, 'm, row=0, col=0'],
        set: ['FE', null, null, 'm, row=0, col=0, n'],
        adj: ['FF', null, null, 'm'],
        det: ['FG', null, null, 'm'],
        inverse: ['FH', null, null, 'm'],
        rref: ['FI', null, null, 'm'],
        row: ['FJ', null, null, 'm'],
        col: ['FK', null, null, 'm'],
        null: ['FL', null, null, 'm'],
        eigenspaces: ['FM', null, null, 'm'],
        diagonal: ['FN', null, null, 'v'],
        rank: ['FO', null, null, 'm'],
        char_poly: ['FP', null, null, 'm'],
        orthogonalize: ['GF', null, null, 'm'],
        pmatrix: ['GH', null, '\\text{projectionmatrix}\\left(&0\\right)', 'b'],
        normalize: ['GI', null, null, 'b'],
        dim: ['GJ', null, null, 'b'],
        as_matrix: ['GK', null, null, 'b'],
        mc: ['HA', null, null, 'student_answer, answer'],
        tf: ['HB', null, null, 'student_answer, answer'],
        reset: ['HC', null, null, 'object'],
        ln: ['LN', null, null, 'n'],
        equations: ['_B', null, null, 'm, v=0'],
        pivots: ['_C', null, null, 'm'],
        free_vars: ['_D', null, null, 'm, b'],
        point: ['_E', null, null, 'v'],
        augment: ['_F', null, null, 'm, v'],
    };
    const functions: {[key: string]: Function} = {};
    for (const f in rawFunctions) {
        if (rawFunctions.hasOwnProperty(f)) {
            const argCount = rawFunctions[f][3] !== '' ? rawFunctions[f][3].split(',').length : 0;
            const arg_string = range(argCount)
                .map(i => '&' + i)
                .join(', ');
            functions[f] = {
                mathCode: rawFunctions[f][0],
                plainText: rawFunctions[f][1] || `${f}(${arg_string})`,
                LaTeX: rawFunctions[f][2] || `\\text{${f}}\\left(${arg_string}\\right)`,
                args: rawFunctions[f][3],
                argCount,
            };
        }
    }
    return functions;
}

export const FUNCTIONS = build();

function remap(): {readonly [key: string]: string} {
    const remappedFunctions: {[key: string]: string} = {};
    for (const c in FUNCTIONS) {
        if (FUNCTIONS.hasOwnProperty(c)) {
            remappedFunctions[FUNCTIONS[c].mathCode] = c;
        }
    }
    return remappedFunctions;
}

export const REMAPPED_FUNCTIONS = remap();
