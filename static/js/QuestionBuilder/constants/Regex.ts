import {CONSTANTS} from './Constants';
import {FUNCTIONS} from './Functions';
import {POSTFIX_OPERATORS} from './OperatorsPostfix';
import {BINARY_OPERATORS} from './OperatorsBinary';
import {PREFIX_OPERATORS} from './OperatorsPrefix';
import {OPERATORS} from './index';

function formatRegex(string: string) {
    return string.replace(/[\[\]\-\\.+*?^$(){}=!<>|:]/g, '\\$&');
}

export function generate() {
    const constantsAndPostfix = [...Object.keys(CONSTANTS), ...Object.keys(POSTFIX_OPERATORS)];
    let part1 = ''; // Contains all remaining multi-character tokens
    let part2 = '|[\\(\\{\\[,;?:'; // Contains all remaining single-character tokens
    const binary_and_prefix = {...BINARY_OPERATORS, ...PREFIX_OPERATORS};
    for (const o in binary_and_prefix) {
        if (binary_and_prefix.hasOwnProperty(o)) {
            if (o.length > 1) {
                part1 += '|' + formatRegex(o);
            } else {
                part2 += formatRegex(o);
            }
        }
    }

    const unaryRegex =
        '\\$\\w+|@\\d+|\\d+(?:\\.\\d+)?|[\\)\\]\\}]|' +
        constantsAndPostfix.map(formatRegex).join('|');
    const REPLACE = Object.keys(OPERATORS)
        .filter(x => x.includes('_'))
        .map(formatRegex);
    const functionRegex = `(${Object.keys(FUNCTIONS).join('|')})\\(`;
    const REGEX = unaryRegex + '|' + functionRegex + part1 + part2 + ']';
    return {unaryRegex, REPLACE, functionRegex, REGEX};
}
