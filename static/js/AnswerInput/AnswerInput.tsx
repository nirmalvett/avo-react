import React, {Component, Fragment, ReactElement} from 'react';
import {
    getMathJax,
    validateMatrix,
    validateNumber,
    validateVector,
} from '../HelperFunctions/Utilities';
import Radio from '@material-ui/core/Radio/Radio';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import ButtonInput from './ButtonInput';
import ButtonInputHorizontalVector from './ButtonInputHorizontalVector';
import {
    CONST_VECTOR,
    CONST_BASIS,
    CONST_BOOLEAN,
    CONST_LINEAR_EXPRESSION,
    CONST_MANUAL_INPUT,
    CONST_MATRIX,
    CONST_MULTIPLE_CHOICE,
    CONST_NUMBER,
    CONST_VECTOR_HORIZONTAL,
} from './InputConsts';

interface AnswerInputProps {
    type: string;
    value: any;
    prompt: string;
    disabled: boolean;
    onBlur: () => void;
    onChange: (ans: any) => void;
    buttonSave: () => void;
}

const BUTTON_INPUT = 0;
const MANUAL_INPUT = 1;

const inputMode = BUTTON_INPUT;

export default class AnswerInput extends Component<AnswerInputProps, {}> {
    render(): ReactElement {
        const {type} = this.props;
        if (type === CONST_BOOLEAN) {
            return this.renderBoolean();
        } else if (type === CONST_MULTIPLE_CHOICE) {
            return this.renderMultipleChoice();
        } else if (type === CONST_NUMBER) {
            return this.renderNumber();
        } else if (type === CONST_LINEAR_EXPRESSION) {
            return this.renderLinearExpression();
        } else if (type === CONST_MANUAL_INPUT) return this.renderManualInput();
        // else if (type === CONST_MANUAL_INPUT_POLYNOMIAL)
        //     return null;
        else if (type === CONST_VECTOR) {
            if (inputMode === BUTTON_INPUT) {
                return this.renderVectorButtonInput();
            } else if (inputMode === MANUAL_INPUT) {
                return this.renderVectorManualInput();
            }
            // } else if (type === CONST_VECTOR_LINEAR_EXPRESSION) {
            //     return null;
        } else if (type === CONST_VECTOR_HORIZONTAL) {
            return this.renderVectorHorizontal();
        } else if (type === CONST_MATRIX) {
            if (inputMode === BUTTON_INPUT) return this.renderMatrixButtonInput();
            else {
                return this.renderMatrixManualInput();
            }
        } else if (type === CONST_BASIS) {
            if (inputMode === BUTTON_INPUT) return this.renderBasisButtonInput();
            else {
                return this.renderBasisManualInput();
            }
        }
        return (
            <Typography variant='body2' color='error'>
                Invalid answer type
            </Typography>
        );
    }

    renderBoolean() {
        return (
            <Fragment>
                {getMathJax(this.props.prompt)}
                <FormControlLabel
                    disabled={this.props.disabled}
                    value={true}
                    control={<Radio color='primary' checked={this.props.value === true} />}
                    onChange={async () => {
                        await this.props.onChange(true);
                        this.props.onBlur();
                    }}
                    label='True'
                />
                <FormControlLabel
                    disabled={this.props.disabled}
                    value={false}
                    control={<Radio color='primary' checked={this.props.value === false} />}
                    onChange={async () => {
                        await this.props.onChange(false);
                        this.props.onBlur();
                    }}
                    label='False'
                />
            </Fragment>
        );
    }

    renderMultipleChoice() {
        const p = this.props.prompt
            .replace('不都', 'None of the above')
            .replace('都', 'All of the above')
            .split('—');
        return (
            <Fragment>
                {getMathJax(p[0])}
                {p.slice(1).map((x, y) => (
                    <Fragment key={x + y}>
                        <FormControlLabel
                            control={
                                <Radio
                                    color='primary'
                                    checked={this.props.value === y.toString()}
                                />
                            }
                            disabled={this.props.disabled}
                            onChange={async () => {
                                await this.props.onChange(y.toString());
                                this.props.onBlur();
                            }}
                            label={getMathJax(x)}
                        />
                        <br />
                    </Fragment>
                ))}
            </Fragment>
        );
    }

    renderNumber() {
        const message = validateNumber(this.props.value);
        return (
            <div>
                {getMathJax(this.props.prompt)}
                <TextField
                    value={this.props.value}
                    onChange={e => this.props.onChange(e.target.value)}
                    onBlur={() => this.props.onBlur()}
                    error={!this.props.disabled && !Array.isArray(message)}
                    label='Enter number'
                    disabled={this.props.disabled}
                    helperText={!Array.isArray(message) ? message : undefined}
                />
                <br />
                <br />
                {Array.isArray(message) ? getMathJax('\\(' + message[0] + '\\)') : undefined}
            </div>
        );
    }

    renderLinearExpression() {
        return (
            <div>
                {getMathJax(this.props.prompt)}
                <TextField
                    value={this.props.value}
                    onChange={e => this.props.onChange(e.target.value)}
                    onBlur={() => this.props.onBlur()}
                    label='Enter expression'
                    disabled={this.props.disabled}
                />
            </div>
        );
    }

    renderManualInput() {
        return (
            <TextField
                value={this.props.value}
                onChange={e => this.props.onChange(e.target.value)}
                onBlur={() => this.props.onBlur()}
                disabled={this.props.disabled}
            />
        );
    }

    renderVectorButtonInput() {
        return (
            <ButtonInput
                prompt={this.props.prompt}
                type={CONST_VECTOR} // this is the type
                disabled={this.props.disabled} // this is whether the input is disabled
                value={this.props.value} // this is the value if a test is resumed
                buttonSave={this.props.buttonSave} // this essentially submits
                onChange={this.props.onChange} // this is the onChange method that modifies the data
            />
        );
    }

    renderVectorManualInput() {
        const vector = validateVector(this.props.value);
        return (
            <div>
                {getMathJax(this.props.prompt)}
                <TextField
                    disabled={this.props.disabled}
                    value={this.props.value}
                    label='Enter vector'
                    onChange={e => this.props.onChange(e.target.value)}
                    onBlur={() => this.props.onBlur()}
                    error={!this.props.disabled && !Array.isArray(vector)}
                    helperText={!Array.isArray(vector) ? vector : undefined}
                />
                <br />
                <br />
                {Array.isArray(vector)
                    ? getMathJax(
                          '\\(\\begin{bmatrix}' + vector.join('\\\\') + '\\end{bmatrix}\\)',
                          'body2',
                      )
                    : undefined}
            </div>
        );
    }

    renderVectorHorizontal() {
        return (
            <ButtonInputHorizontalVector
                prompt={this.props.prompt}
                type={CONST_VECTOR_HORIZONTAL} // this is the type
                disabled={this.props.disabled} // this is whether the input is disabled
                value={this.props.value} // this is the value if a test is resumed
                buttonSave={this.props.buttonSave} // this essentially submits
                onChange={this.props.onChange} // this is the onChange method that modifies the data
            />
        );
    }

    renderMatrixButtonInput() {
        return (
            <ButtonInput
                prompt={this.props.prompt}
                type={CONST_MATRIX} // this is the type
                disabled={this.props.disabled} // this is whether the input is disabled
                value={this.props.value} // this is the value if a test is resumed
                buttonSave={this.props.buttonSave} // this essentially submits
                onChange={this.props.onChange} // this is the onChange method that modifies the data
            />
        );
    }

    renderMatrixManualInput() {
        const matrix = validateMatrix(this.props.value) as string[][];
        return (
            <div>
                {getMathJax(this.props.prompt)}
                <TextField
                    disabled={this.props.disabled}
                    multiline
                    value={this.props.value}
                    label='Enter matrix'
                    onChange={e => this.props.onChange(e.target.value)}
                    onBlur={() => this.props.onBlur()}
                    error={!this.props.disabled && !Array.isArray(matrix)}
                    helperText={!Array.isArray(matrix) ? matrix : undefined}
                />
                <br />
                <br />
                {Array.isArray(matrix)
                    ? getMathJax(
                          '\\(\\begin{bmatrix}' +
                              matrix.map(x => x.join('&')).join('\\\\') +
                              '\\end{bmatrix}\\)',
                          'body2',
                      )
                    : undefined}
            </div>
        );
    }

    renderBasisButtonInput() {
        return (
            <ButtonInput
                prompt={this.props.prompt}
                type={CONST_BASIS} // this is the type
                disabled={this.props.disabled} // this is whether the input is disabled
                value={this.props.value} // this is the value if a test is resumed
                buttonSave={this.props.buttonSave} // this essentially submits
                onChange={this.props.onChange} // this is the onChange method that modifies the data
            />
        );
    }

    renderBasisManualInput() {
        const basis = validateMatrix(this.props.value) as string[][];
        return (
            <div>
                {getMathJax(this.props.prompt)}
                <TextField
                    disabled={this.props.disabled}
                    multiline
                    value={this.props.value}
                    label='Enter basis'
                    onChange={e => this.props.onChange(e.target.value)}
                    onBlur={() => this.props.onBlur()}
                    error={!this.props.disabled && !Array.isArray(basis)}
                    helperText={!Array.isArray(basis) ? basis : undefined}
                />
                <br />
                <br />
                {Array.isArray(basis) &&
                    getMathJax(
                        '\\(\\left\\{' +
                            basis
                                .map(x => `\\begin{bmatrix}${x.join('\\\\')}\\end{bmatrix}`)
                                .join(',') +
                            '\\right\\}\\)',
                    )}
            </div>
        );
    }
}
