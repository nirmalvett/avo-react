import {
    FUNCTIONS,
    OPERATORS,
    REMAPPED_CONSTANTS,
    REMAPPED_OPERATORS,
    REMAPPED_FUNCTIONS,
} from '../constants';

export function buildPlainText(mathCode: string): string[] {
    console.debug(mathCode);
    let stack: {expr: string; priority: number}[] = [];
    const tokens: string[] = mathCode.split(' ');
    for (const token of tokens) {
        if (/^\$\w+$/.test(token)) {
            stack.push({expr: token, priority: 8});
        } else if (/^@\d+$/.test(token)) {
            stack.push({expr: '@' + (Number(token.slice(1)) + 1), priority: 8});
        } else if (/^-?\d+(\.\d+)?$/.test(token)) {
            stack.push({expr: token, priority: 8});
        } else if (token === ']') {
            let rows = Number(stack.splice(-2, 1)[0].expr);
            let cols = Number(stack.splice(-1, 1)[0].expr);
            let args = stack.splice(-rows * cols);
            let rowList = [];
            for (let r = 0; r < rows; r++)
                rowList.push(
                    args
                        .slice(r * cols, (r + 1) * cols)
                        .map(x => x.expr)
                        .join(', '),
                );
            stack.push({expr: '[' + rowList.join('; ') + ']', priority: 8});
        } else if (token === '}') {
            let count = stack.splice(-1, 1)[0].expr;
            let args = stack.splice(-count);
            stack.push({expr: '{' + args.map(x => x.expr).join(', ') + '}', priority: 8});
        } else if (token === 'BD') {
            let args = stack.splice(-3).map(x => (x.priority >= 0 ? x.expr : '(' + x.expr + ')'));
            stack.push({expr: args[0] + ' ? ' + args[1] + ' : ' + args[2], priority: -1});
        } else if (REMAPPED_CONSTANTS[token] !== undefined) {
            stack.push({expr: REMAPPED_CONSTANTS[token], priority: 8});
        } else if (REMAPPED_OPERATORS[token] !== undefined) {
            const o = OPERATORS[REMAPPED_OPERATORS[token]];
            let str = REMAPPED_OPERATORS[token];
            if (o.type !== 'postfix') {
                let x = stack.pop();
                if (x === undefined) throw new Error();
                if (x.priority > o.ptOp2) str += ' ' + x.expr;
                else str += ' (' + x.expr + ')';
            }
            if (o.type !== 'prefix') {
                let x = stack.pop();
                if (x === undefined) throw new Error();
                if (x.priority >= o.ptOp1) str = x.expr + ' ' + str;
                else str = '(' + x.expr + ') ' + str;
            }
            stack.push({expr: str, priority: o.ptOut});
        } else if (REMAPPED_FUNCTIONS[token] !== undefined) {
            let f = FUNCTIONS[REMAPPED_FUNCTIONS[token]];
            stack.push({
                expr:
                    REMAPPED_FUNCTIONS[token] +
                    '(' +
                    stack
                        .splice(-f.argCount)
                        .map(x => x.expr)
                        .join(', ') +
                    ')',
                priority: 8,
            });
        } else if (token !== '_A') {
            console.error('Unhandled token: ' + token);
        }
    }
    if (stack.length !== 1) {
        console.error(
            `${stack.length} expressions returned from buildPlainText:\n${stack
                .map(x => x.expr)
                .join('\n')}`,
        );
    }
    return stack.map(x => x.expr);
}
