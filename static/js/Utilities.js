import React from "react";
import MathJax from "react-mathjax2";
import Typography from "@material-ui/core/Typography/Typography";
import {uniqueKey} from "./helpers";

export function getMathJax(text, variant='body2') {
    // Initialize an empty list of MathJax elements
    let result = [];
    while (true) {
        let marker0 = text.indexOf('$\\\\$');
        let marker1 = text.indexOf('\\(');
        let marker2 = text.indexOf('\\[');
        // If the first structure is \(
        if (marker0 !== -1 && (marker1 === -1 || marker0 < marker1) && (marker2 === -1 || marker0 < marker2)) {
            // Add all the plain text before the math
            result.push(text.substr(0, marker0));
            result.push(<br/>);
            text = text.slice(marker0 + 4);
        } else if (marker1 !== -1 && (marker2 === -1 || marker1 < marker2)) {
            // Add all the plain text before the math
            result.push(text.substr(0, marker1));
            // Find the \)
            let endMarker = text.indexOf('\\)');
            // If there is no \)
            if (endMarker === -1) {
                // Append the rest of the string as an inline equation
                result.push(<MathJax.Node inline key={uniqueKey()}>{text.slice(marker1 + 2)}</MathJax.Node>);
                console.warn('Invalid LaTeX: Missing closing \\)');
                break;
            }
            // Add the inline math element
            result.push(<MathJax.Node inline key={uniqueKey()}>{text.slice(marker1 + 2, endMarker)}</MathJax.Node>);
            // Remove the beginning of the string up to and including the \)
            text = text.slice(endMarker + 2);
        }
        // Else if the first structure is \[
        else if (marker2 !== -1) {
            // Add all the plain text before the math
            result.push(text.substr(0, marker2));
            // Find the \]
            let endMarker = text.indexOf('\\]');
            // If there is no \]
            if (endMarker === -1) {
                // Append the rest of the string as an block equation
                result.push(<MathJax.Node key={uniqueKey()}>{text.slice(marker2 + 2)}</MathJax.Node>);
                console.warn('Invalid LaTeX: Missing closing \\]');
                break;
            }
            // Add the block math element
            result.push(<MathJax.Node key={uniqueKey()}>{text.slice(marker2 + 2, endMarker)}</MathJax.Node>);
            // Remove the beginning of the string up to and including the \]
            text = text.slice(endMarker + 2);
        }
        // Else - this means that the rest of the string is plain text
        else {
            // Add the remaining plain text to the list
            result.push(text);
            break;
        }
    }
    return <MathJax.Context input='tex'><Typography variant={variant}>{result}</Typography></MathJax.Context>
}

export function validateNumber(text) {
    // Remove whitespace and check if string is empty
    if (text === undefined || text.replace(/ /g, '').length === 0)
        return 'No answer given';

    // Split string into tokens
    let regex = '\\d+(?:\\.\\d+)?|(sqrt|sin|cos|tan|arcsin|arccos|arctan)\\(|[()+\\-*/^]';
    text = text.replace(/ /g, '').replace(new RegExp(regex, 'g'), ' $& ').trim().replace(/ {2,}/g, ' ');
    let tokenList = text.split(' ');

    // Check for invalid tokens
    let errorList = tokenList.filter(x => !new RegExp(regex).test(x));
    if (errorList.length !== 0)
        return 'Invalid tokens: ' + errorList.join(', ');

    // Determine which hyphens are negative signs instead of subtraction operators
    for(let i=0; i<tokenList.length; i++) {
        if (tokenList[i] === '-' && (i === 0 || !/^(?:\d+(?:\.\d+)?|\))$/g.test(tokenList[i - 1]))) {
            if (i + 1 === tokenList.length)
                return 'Negative sign at end of expression';
            else if (tokenList[i - 1] === '^')
                tokenList[i] = '---';
            else
                tokenList[i] = '--';
        }
    }

    // Find all the operators in the expression, and determine their levels of precedence
    let bracket_level = 0;
    let operations = [];
    let operators = {"---": 8, "--": 6, "+": 4, "-": 4, "*": 5, "/": 5, "^": 7};
    for(let i=0; i<tokenList.length; i++) {
        let token = tokenList[i];
        if (/^\d+(?:\.\d+)?$/.test(token)) {
            // noinspection JSValidateTypes
            tokenList[i] = ['~', token, 9];
        } else if (operators[token] !== undefined) {
            // noinspection JSValidateTypes
            tokenList[i] = [token, bracket_level + 1000 * operators[token] - i];
            operations.push(tokenList[i]);
        } else if (token.endsWith('(')) {
            // noinspection JSValidateTypes
            tokenList[i] = [token, bracket_level + 8000 - i];
            operations.push(tokenList[i]);
            bracket_level += 10000;
        } else if (token === ')')
            bracket_level -= 10000;
        else
            return 'Something went wrong';
        if (bracket_level < 0)
            return 'Mismatched close bracket';
    }
    if (bracket_level !== 0)
        return 'Mismatched open bracket';
    // noinspection JSCheckFunctionSignatures
    operations.sort((a, b) => b[1] - a[1]);

    let brackets = (e, p) => e[2] < p ? ' \\left( ' + e[1] + ' \\right) ' : e[1];
    let isVar = i => tokenList[i][0] === '~';

    for(let i=0; i<operations.length; i++) {
        let operation = operations[i][0];
        let pos = tokenList.indexOf(operations[i]);
        if (operation === '---' || operation === '--') {
            if (pos === tokenList.length - 1 || !isVar(pos + 1))
                return 'Missing number for negative sign';
            tokenList.splice(pos, 1);
            // noinspection JSValidateTypes
            tokenList[pos] = ['~', '-' + brackets(tokenList[pos], 6), 6];
        } else if (['+', '-', '*', '/', '^'].includes(operation)) {
            if (pos === 0 || !isVar(pos - 1))
                return 'Missing first operand for ' + operation;
            if (pos === tokenList.length - 1 || !isVar(pos + 1))
                return 'Missing second operand for ' + operation;
            let a = tokenList.splice(pos - 1, 1)[0];
            let b = tokenList.splice(pos, 1)[0];
            if (operation === '+') {
                // noinspection JSValidateTypes
                tokenList[pos - 1] = ['~', brackets(a, 4) + '+' + brackets(b, 4), 4];
            } else if (operation === '-') {
                // noinspection JSValidateTypes
                tokenList[pos - 1] = ['~', brackets(a, 4) + '-' + brackets(b, 5), 4];
            } else if (operation === '*') {
                // noinspection JSValidateTypes
                tokenList[pos - 1] = ['~', brackets(a, 5) + '*' + brackets(b, 5), 5];
            } else if (operation === '/') {
                // noinspection JSValidateTypes
                tokenList[pos - 1] = ['~', ' \\frac{' + brackets(a, 0) + '}{' + brackets(b, 0) + '}', 7];
            } else if (operation === '^') {
                // noinspection JSValidateTypes
                tokenList[pos - 1] = ['~', brackets(a, 7) + '^{' + brackets(b, 0) + '}', 7];
            } else
                return 'Something went wrong';
        } else if (operation === '(') {
            if (pos > tokenList.length - 3 || !isVar(pos + 1) || tokenList[pos + 2] !== ')')
                return 'Invalid bracket structure';
            tokenList.splice(pos + 2, 1);
            tokenList.splice(pos, 1);
        } else if (operation.endsWith('(')) {
            if (pos > tokenList.length - 3 || !isVar(pos + 1) || tokenList[pos + 2] !== ')')
                return 'Invalid function call';
            tokenList.splice(pos + 2, 1);
            let fn = tokenList.splice(pos, 1)[0][0].slice(0,-1);
            if (fn === 'sqrt') {
                // noinspection JSValidateTypes
                tokenList[pos] = ['~', '\\sqrt{' + brackets(tokenList[pos],0) + '}', 8];
            } else {
                // noinspection JSValidateTypes
                tokenList[pos] = ['~', '\\text{' + fn + '}\\left( ' + tokenList[pos][1] + ' \\right) ', 8];
            }
        } else
            return 'Something went wrong';
    }
    return tokenList.length === 1 ? [tokenList[0][1]] : 'Expression does not resolve to single number';
}

export function validateVector(text) {
    let matrix = text.replace(/ /g, '');
    if (matrix.length === 0)
        return 'No answer given';
    let cells = matrix.split(',');
    let validation = cells.map(cell => validateNumber(cell));
    if (!validation.every(cell => Array.isArray(cell))) {
        validation = validation.map((cell, c) => Array.isArray(cell) ? null : '[pos=' + (c+1) + '] ' + cell);
        validation = [].concat.apply([], validation);
        validation = validation.filter(x => x !== null);
        if (validation.length > 1)
            return validation[0] + ' +' + (validation.length-1) + ' error(s)';
        else
            return validation[0];
    }
    return validation.map(cell => cell[0]);
}

export function validateMatrix(text) {
    let matrix = text.replace(/ /g, '');
    if (matrix.length === 0)
        return 'No answer given';
    let cells = matrix.split('\n').map(x => x.split(','));
    let cols = cells[0].length;
    if (!cells.every(x => x.length === cols))
        return 'Inconsistent row length';
    let validation = cells.map(row => row.map(cell => validateNumber(cell)));
    if (!validation.every(row => row.every(cell => Array.isArray(cell)))) {
        validation = validation.map((row, r) => row.map((cell, c) => Array.isArray(cell) ? null :
            '[row=' + (r+1) + ', col=' + (c+1) + '] ' + cell));
        validation = [].concat.apply([], validation);
        validation = validation.filter(x => x !== null);
        if (validation.length > 1)
            return validation[0] + ' +' + (validation.length-1) + ' error(s)';
        else
            return validation[0];
    }
    return validation.map(row => row.map(cell => cell[0]));
}

export function getDateString(date) {
    date = date.toString();
    let hour = parseInt(date.slice(8, 10));
    let x = hour > 11 ? 'pm' : 'am';
    hour = ((hour + 11) % 12) + 1;
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
        'November', 'December'][date.slice(4, 6) - 1] + ' ' + date.slice(6, 8) //+ ', ' + date.slice(0, 4)
        + ' at ' + hour + ':' + date.slice(10, 12) + x;
}

export function copy(object) {
    return JSON.parse(JSON.stringify(object));
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}