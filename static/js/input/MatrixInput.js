import React from 'react';
import TextField from "@material-ui/core/TextField/TextField";
import {getMathJax} from "../Utilities";

export default class MatrixInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answer: this.props.answer
        };
    }

    render() {
        let error = this.validateMatrix();
        return (
            <div>
                <TextField multiline value={this.state.answer} label='Enter matrix' onChange={(e) => this.onChange(e)}
                           error={!Array.isArray(error)} helperText={Array.isArray(error) ? undefined: error}/>
                <br/><br/>
                {Array.isArray(error) ? getMathJax('\\(\\begin{bmatrix}' + error.map(x => x.map(y => '\\text{' + y + '}').join('&')).join('\\\\') + '\\end{bmatrix}\\)', 'body1') : undefined}
            </div>
        );
    }

    onChange(e) {
        this.setState({answer: e.target.value});
        this.props.onChange();
    }

    validateMatrix() {
        let matrix = this.state.answer.replace(/ /g, '').replace(/\n/g, ';');
        if (matrix.length === 0)
            return 'No answer given';
        let cells = matrix.split(';').map(x => x.split(','));
        let cols = cells[0].length;
        if (!cells.every(x => x.length === cols))
            return 'Inconsistent row length';
        let validation = cells.map(row => row.map(cell => this.validate(cell)));
        validation = validation.map((row, r) => row.map((cell, c) => cell === false ? null :
            '(' + (r+1) + ',' + (c+1) + ') ' + cell));
        validation = [].concat.apply([], validation);
        validation = validation.filter(x => x !== null);
        if (validation.length !== 0) {
            if (validation.length > 3)
                return validation.slice(0,3).join(' | ') + ' | +' + (validation.length-3) + ' errors';
            else
                return validation.join(' | ');
        }
        return cells;
    }

    validate(number) {
        if (number.replace(/ /g, '').length === 0)
            return 'No answer given';
        let regex = '\\d+(?:\\.\\d+)?|(sqrt|sin|cos|tan|arcsin|arccos|arctan)\\(|[()+\\-*/^]';
        let tokenList = number.replace(/ /g, '').replace(new RegExp(regex, 'g'), ' $& ').trim()
            .replace(/ {2,}/g, ' ').split(' ');
        if (!tokenList.every(x => new RegExp(regex).test(x)))
            return 'Invalid tokens: ' + tokenList.filter(x => !new RegExp(regex).test(x)).join(', ');

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

        let brackets = 0;
        let operations = [];
        let operators = {"---": 8, "--": 6, "+": 4, "-": 4, "*": 5, "/": 5, "^": 7};
        for(let i=0; i<tokenList.length; i++) {
            let token = tokenList[i];
            if (/^\d+(?:\.\d+)?$/.test(token))
                tokenList[i] = '~';
            else if (operators[token] !== undefined) {
                // noinspection JSValidateTypes
                tokenList[i] = [token, brackets + 1000 * operators[token] - i];
                operations.push(tokenList[i]);
            } else if (token.endsWith('(')) {
                // noinspection JSValidateTypes
                tokenList[i] = [token, brackets + 8000 - i];
                operations.push(tokenList[i]);
                brackets += 10000;
            } else if (token === ')')
                brackets -= 10000;
            else {
                return 'Something went wrong';
            }
            if (brackets < 0)
                return 'Mismatched close bracket';
        }
        if (brackets !== 0)
            return 'Mismatched open bracket';

        // noinspection JSCheckFunctionSignatures
        operations.sort((a, b) => a[1]<b[1]);

        for(let i=0; i<operations.length; i++) {
            let operation = operations[i][0];
            let pos = tokenList.indexOf(operations[i]);
            if (operation === '---' || operation === '--') {
                if (pos === tokenList.length - 1 || tokenList[pos + 1] !== '~')
                    return 'Missing number for negative sign';
                tokenList.splice(pos, 1);
            } else if (['+', '-', '*', '/', '^'].includes(operation)) {
                if (pos === 0 || tokenList[pos - 1] !== '~')
                    return 'Missing first operand for ' + operation;
                if (pos === tokenList.length - 1 || tokenList[pos + 1] !== '~')
                    return 'Missing second operand for ' + operation;
                tokenList.splice(pos - 1, 2);
            } else if (operation.endsWith('(')) {
                if (pos > tokenList.length - 3 || tokenList[pos + 1] !== '~' || tokenList[pos + 2] !== ')')
                    return 'Invalid function call';
                tokenList.splice(pos + 2, 1);
                tokenList.splice(pos, 1);
            } else {
                return 'Something went wrong';
            }
        }
        return tokenList.length === 1 ? false : 'Expression does not resolve to single number';
    }
}