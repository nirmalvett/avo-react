import React, {ReactElement} from 'react';
import {Typography} from '@material-ui/core';
import {CONSTANTS, FUNCTIONS, OPERATORS, REGEX, REPLACE, unaryRegex} from '../constants';
import {createMuiTheme} from '@material-ui/core';
import {CompileFailure, CompileSuccess} from '../QuestionBuilder.models';

function getTokens(text: string): string[] {
    for (const r of REPLACE) {
        text = text.replace(new RegExp(r.replace(/_/g, ' '), 'g'), r);
    }
    text = text.replace(new RegExp(REGEX, 'g'), ' $& ');
    text = text.trim().replace(/ {2,}/g, ' ');
    return text.split(' ');
}

function validateTokens(tokens: readonly string[]): CompileFailure | void {
    let error = false;
    const str: (ReactElement | string)[] = [];
    for (const token of tokens) {
        if (new RegExp(`^(?:${REGEX})$`).test(token) || /^-?\d+(?:\.\d+)?$/.test(token)) {
            if (typeof str[str.length - 1] === 'string') {
                str[str.length - 1] += ' ' + token.replace(/_/g, ' ');
            } else {
                str.push(token);
            }
        } else {
            error = true;
            str.push(<span style={{color: createMuiTheme().palette.error.main}}> {token} </span>);
        }
    }
    if (error) {
        return {success: false, error: <Typography>{str}</Typography>};
    }
}

function findUnaryMinus(tokens: string[]): CompileFailure | void {
    // Make '-' a negative sign when appropriate.
    // --- and -- are used as a unary_regex minus, and - is used for subtraction.
    for (let i = 0; i < tokens.length; i++) {
        if (
            tokens[i] === '-' &&
            (i === 0 || !new RegExp(`^(?:${unaryRegex})$`).test(tokens[i - 1]))
        ) {
            if (i + 1 === tokens.length) {
                return {
                    success: false,
                    error: <Typography color='error'>Unary minus at end of expression</Typography>,
                };
            } else if (tokens[i + 1] === '^') {
                tokens[i] = '---';
            } else if (/^\d+(?:\.\d+)?$/.test(tokens[i + 1])) {
                tokens.splice(i, 1);
                tokens[i] = '-' + tokens[i];
            } else {
                tokens[i] = '--';
            }
        }
    }
}

interface TokenConverterResponse {
    success: true;
    operations: OperationToken[];
    newTokens: Token[];
}

function convertToTokens(tokens: readonly string[]): TokenConverterResponse | CompileFailure {
    let brackets = 0;
    const operations: OperationToken[] = [];
    const newTokens: Token[] = [];
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (/^-?\d+(?:\.\d+)?$/.test(token)) {
            newTokens.push({
                type: 'operand',
                mathCode: token,
                plainText: token,
                LaTeX: token,
                plainTextPriority: 8,
                latexPriority: 8,
            });
        } else if (/^\$\w+$/.test(token)) {
            newTokens.push({
                type: 'operand',
                mathCode: token,
                plainText: token,
                LaTeX: '\\color{DarkOrange}{' + token + '}',
                plainTextPriority: 8,
                latexPriority: 8,
            });
        } else if (/^@\d+$/.test(token)) {
            newTokens.push({
                type: 'operand',
                mathCode: '@' + (Number(token.substr(1)) - 1),
                plainText: token,
                LaTeX: '\\color{Green}{' + token + '}',
                plainTextPriority: 8,
                latexPriority: 8,
            });
        } else if (token in CONSTANTS) {
            newTokens.push({
                type: 'operand',
                mathCode: CONSTANTS[token].mathCode,
                plainText: CONSTANTS[token].plainText,
                LaTeX: CONSTANTS[token].LaTeX,
                plainTextPriority: 8,
                latexPriority: 8,
            });
        } else if (token in OPERATORS) {
            const operator: OperationToken = {
                type: 'operator',
                name: token,
                priority: brackets + 1000 * OPERATORS[token].priority - i,
            };
            newTokens.push(operator);
            operations.push(operator);
        } else if (/[({\[]/.test(token)) {
            const operator: OperationToken = {
                type: 'operator',
                name: token,
                priority: brackets + 8000 - i,
            };
            newTokens.push(operator);
            operations.push(operator);
            brackets += 10000;
        } else if (token === '?') {
            const operator: OperationToken = {
                type: 'operator',
                name: token,
                priority: brackets - 1000 + i,
            };
            newTokens.push(operator);
            operations.push(operator);
        } else if (token === ')' || token === '}' || token === ']') {
            brackets -= 10000;
            newTokens.push({type: token});
        } else if (token !== ',' && token !== ';' && token !== ':') {
            console.error("Something went wrong when handling this token: '" + token + "'");
        } else {
            newTokens.push({type: token});
        }
        if (brackets < 0) {
            return {
                success: false,
                error: <Typography color='error'>Mismatched close bracket</Typography>,
            };
        }
    }
    if (brackets !== 0) {
        return {
            success: false,
            error: <Typography color='error'>Mismatched open bracket</Typography>,
        };
    }

    operations.sort((a, b) => b.priority - a.priority);
    return {success: true, newTokens, operations};
}

interface OperationToken {
    type: 'operator';
    name: string;
    priority: number;
}

interface OperandToken {
    type: 'operand';
    mathCode: string;
    plainText: string;
    LaTeX: string;
    plainTextPriority: number;
    latexPriority: number;
}

interface PunctuationToken {
    type: ')' | ']' | '}' | ',' | ';' | ':';
}

type Token = OperationToken | OperandToken | PunctuationToken;

export function buildMathCode(text: string): CompileSuccess | CompileFailure {
    console.debug(text);
    if (/^ *$/.test(text))
        return {success: false, error: <Typography color='error'>No expression given</Typography>};
    const tokens: string[] = getTokens(text);
    {
        const error1 = validateTokens(tokens);
        if (error1) {
            return error1;
        }
        const error2 = findUnaryMinus(tokens);
        if (error2) {
            return error2;
        }
    }
    const response = convertToTokens(tokens);
    if (!response.success) {
        return response;
    }
    const {operations, newTokens} = response;

    for (let i = 0; i < operations.length; i++) {
        let o = operations[i].name;
        let pos = newTokens.indexOf(operations[i]);
        if (o in OPERATORS) {
            let data = OPERATORS[o];
            let args: OperandToken[] = [];
            let tx_p = [];
            let result: OperandToken = {
                type: 'operand',
                mathCode: data.mathCode,
                plainText: data.plainText,
                LaTeX: data.LaTeX,
                plainTextPriority: data.ptOut,
                latexPriority: data.texOut,
            };
            if (data.type !== 'prefix') {
                if (pos === 0 || newTokens[pos - 1].type !== 'operand') {
                    return {
                        success: false,
                        error: <Typography color='error'>Missing first operand</Typography>,
                    };
                }
                let x = newTokens[pos - 1] as OperandToken;
                result.plainText =
                    (x.plainTextPriority < data.ptOp1 ? '(' + x.plainText + ')' : x.plainText) +
                    ' ' +
                    result.plainText;
                args.push(newTokens.splice(pos - 1, 1)[0] as OperandToken);
                tx_p.push(data.texOp1);
                pos--;
            }
            if (data.type !== 'postfix') {
                if (pos === newTokens.length - 1 || newTokens[pos + 1].type !== 'operand') {
                    console.error(pos, newTokens, data);
                    return {
                        success: false,
                        error: <Typography color='error'>Missing second operand</Typography>,
                    };
                }
                let x = newTokens[pos + 1] as OperandToken;
                result.plainText =
                    result.plainText +
                    ' ' +
                    (x.plainTextPriority < data.ptOp2 ? '(' + x.plainText + ')' : x.plainText);
                args.push(newTokens.splice(pos + 1, 1)[0] as OperandToken);
                tx_p.push(data.texOp2);
            }
            result.mathCode = args.map(x => x.mathCode).join(' ') + ' ' + result.mathCode;
            for (let i = 0; i < args.length; i++)
                result.LaTeX = result.LaTeX.replace(
                    `&${i}`,
                    tx_p[i] > args[i].latexPriority
                        ? '\\left(' + args[i].LaTeX + '\\right)'
                        : args[i].LaTeX,
                );
            newTokens[pos] = result;
        } else if (o.substr(o.length - 1) === '(' && o.slice(0, -1) in FUNCTIONS) {
            let data = FUNCTIONS[o.slice(0, -1)];
            let args: OperandToken[] = [];
            let signature = data.args
                .split(',')
                .map(x => x.trim())
                .map(x => x.split('='));
            while (newTokens[pos + 1].type !== ')') {
                if (args.length === signature.length) {
                    return {
                        success: false,
                        error: (
                            <Typography color='error'>Too many arguments in function</Typography>
                        ),
                    };
                } else if (newTokens[pos + 1].type === 'operand') {
                    args.push(newTokens.splice(pos + 1, 1)[0] as OperandToken);
                    if (newTokens[pos + 1].type === ',' && newTokens[pos + 2].type !== ')')
                        newTokens.splice(pos + 1, 1);
                    else if (newTokens[pos + 1].type !== ')')
                        return {
                            success: false,
                            error: (
                                <Typography color='error'>
                                    Can't parse arguments in function
                                </Typography>
                            ),
                        };
                } else if (newTokens[pos + 1].type === ',') {
                    newTokens.splice(pos + 1, 1);
                    let value: undefined | string = signature[args.length][1];
                    if (value === undefined)
                        return {
                            success: false,
                            error: (
                                <Typography color='error'>
                                    Non-default arguments cannot be left blank
                                </Typography>
                            ),
                        };
                    args.push({
                        type: 'operand',
                        mathCode: value,
                        plainText: value,
                        LaTeX: value,
                        plainTextPriority: 8,
                        latexPriority: 8,
                    });
                } else
                    return {
                        success: false,
                        error: <Typography color='error'>Invalid argument in function</Typography>,
                    };
            }
            newTokens.splice(pos + 1, 1);
            while (args.length < signature.length) {
                let value: undefined | string = signature[args.length][1];
                if (value === undefined)
                    return {
                        success: false,
                        error: (
                            <Typography color='error'>
                                Non-default arguments cannot be left blank
                            </Typography>
                        ),
                    };
                args.push({
                    type: 'operand',
                    mathCode: value,
                    plainText: value,
                    LaTeX: value,
                    plainTextPriority: 8,
                    latexPriority: 8,
                });
            }
            const currentToken: OperandToken = {
                type: 'operand',
                mathCode: args.map(x => x.mathCode).join(' ') + ' ' + data.mathCode,
                plainText: data.plainText,
                LaTeX: data.LaTeX,
                plainTextPriority: 8,
                latexPriority: 8,
            };
            for (let i = 0; i < args.length; i++) {
                let v = '&' + i;
                currentToken.plainText = currentToken.plainText.replace(v, args[i].plainText);
                currentToken.LaTeX = currentToken.LaTeX.replace(v, args[i].LaTeX);
            }
            newTokens[pos] = currentToken;
        } else if (o === '(') {
            newTokens.splice(pos, 1);
            if (newTokens[pos + 1].type !== ')')
                return {
                    success: false,
                    error: <Typography color='error'>Invalid bracket structure</Typography>,
                };
            newTokens.splice(pos + 1, 1);
        } else if (o === '{') {
            let args: OperandToken[] = [];
            while (newTokens[pos + 1].type !== '}') {
                if (newTokens[pos + 1].type === 'operand') {
                    args.push(newTokens.splice(pos + 1, 1)[0] as OperandToken);
                    if (newTokens[pos + 1].type === ',' && newTokens[pos + 2].type !== '}')
                        newTokens.splice(pos + 1, 1);
                    else if (newTokens[pos + 1].type !== '}')
                        return {
                            success: false,
                            error: (
                                <Typography color='error'>
                                    Can't parse arguments in basis
                                </Typography>
                            ),
                        };
                } else
                    return {
                        success: false,
                        error: <Typography color='error'>Invalid argument in basis</Typography>,
                    };
            }
            newTokens.splice(pos + 1, 1);
            newTokens[pos] = {
                type: 'operand',
                mathCode: args.map(x => x.mathCode).join(' ') + ' ' + args.length + ' }',
                plainText: '{' + args.map(x => x.plainText).join(', ') + '}',
                LaTeX: '\\left\\{' + args.map(x => x.LaTeX).join(',') + '\\right\\}',
                plainTextPriority: 8,
                latexPriority: 8,
            };
        } else if (o === '[') {
            let rows = 1;
            let cols = 0;
            for (let x = pos + 1; newTokens[x].type !== ']'; x++) {
                if (newTokens[x].type === ';') {
                    rows += 1;
                } else if (newTokens[x].type === 'operand') {
                    cols += 1;
                }
            }
            if (cols % rows !== 0) {
                return {
                    success: false,
                    error: (
                        <Typography color='error'>
                            Row length must be consistent within a matrix
                        </Typography>
                    ),
                };
            }
            cols /= rows;
            let result: OperandToken = {
                type: 'operand',
                mathCode: '',
                plainText: '[',
                LaTeX: '\\begin{bmatrix}',
                plainTextPriority: 8,
                latexPriority: 8,
            }; //['', '[', '\\begin{bmatrix}'];
            for (let r = 1; r <= rows; r++) {
                for (let c = 1; c <= cols; c++) {
                    let cell = newTokens.splice(pos + 1, 1)[0] as OperandToken;
                    result.mathCode += cell.mathCode + ' ';
                    result.plainText += cell.plainText;
                    result.LaTeX += cell.LaTeX;
                    if (c < cols) {
                        if (newTokens.splice(pos + 1, 1)[0].type !== ',')
                            return {
                                success: false,
                                error: (
                                    <Typography color='error'>Can't parse matrix cells</Typography>
                                ),
                            };
                        result.plainText += ', ';
                        result.LaTeX += ' & ';
                    }
                }
                if (r < rows) {
                    if (newTokens.splice(pos + 1, 1)[0].type !== ';')
                        return {
                            success: false,
                            error: <Typography color='error'>Can't parse matrix cells</Typography>,
                        };
                    result.plainText += '; ';
                    result.LaTeX += '\\\\';
                }
            }
            if (newTokens.splice(pos + 1, 1)[0].type !== ']')
                return {
                    success: false,
                    error: <Typography color='error'>Can't parse matrix cells</Typography>,
                };
            result.mathCode += rows + ' ' + cols + ' ]';
            result.plainText += ']';
            result.LaTeX += '\\end{bmatrix}';
            newTokens[pos] = result;
        } else if (o === '?') {
            if (pos === 0)
                return {
                    success: false,
                    error: (
                        <Typography color='error'>
                            Expression can't start with ternary operator
                        </Typography>
                    ),
                };
            let [arg0, , arg2, arg3, arg4] = newTokens.slice(pos - 1, pos + 4);
            if (
                arg0.type !== 'operand' ||
                arg2.type !== 'operand' ||
                arg3.type !== ':' ||
                arg4.type !== 'operand'
            ) {
                return {
                    success: false,
                    error: (
                        <Typography color='error'>Invalid ternary operator structure</Typography>
                    ),
                };
            }
            newTokens[pos - 1] = {
                type: 'operand',
                mathCode: arg0.mathCode + ' ' + arg2.mathCode + ' ' + arg4.mathCode + ' BD',
                plainText: arg0.plainText + ' ? ' + arg2.plainText + ' : ' + arg4.plainText,
                LaTeX: arg0.LaTeX + ' \\text{ ? } ' + arg2.LaTeX + ' \\text{ : } ' + arg4.LaTeX,
                plainTextPriority: -1,
                latexPriority: -1,
            };
            newTokens.splice(pos, 4);
        } else {
            return {
                success: false,
                error: <Typography color='error'>Something went wrong</Typography>,
            };
        }
    }

    if (newTokens.length > 1) {
        return {
            success: false,
            error: (
                <Typography color='error'>Expression does not resolve to single term</Typography>
            ),
        };
    }

    const token = newTokens[0];
    if (token.type === 'operand') {
        return {
            success: true,
            mathCode: token.mathCode,
            plainText: token.plainText,
            LaTeX: token.LaTeX,
        };
    } else {
        return {
            success: false,
            error: <Typography color='error'>This should never happen</Typography>,
        };
    }
}
