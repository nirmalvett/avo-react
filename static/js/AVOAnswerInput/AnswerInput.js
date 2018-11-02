import React from 'react';
import {getMathJax, sleep, validateMatrix, validateNumber, validateVector} from '../Utilities';
import Radio from '@material-ui/core/Radio/Radio';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import ButtonInput from "./ButtonInput"
import { CONST_VECTOR, CONST_VECTOR_LINEAR_EXPRESSION, CONST_BASIS, CONST_BOOLEAN, CONST_LINEAR_EXPRESSION,
        CONST_MANUAL_INPUT, CONST_MANUAL_INPUT_POLYNOMIAL, CONST_MATRIX, CONST_MULTIPLE_CHOICE, CONST_NUMBER
} from "./InputConsts";


const BUTTON_INPUT = 0;
const MANUAL_INPUT = 1;
export default class AnswerInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
            value: this.props.value,
            prompt: this.props.prompt,
            disabled: this.props.disabled,
            inputMode: BUTTON_INPUT, // should be something from the user later to indicate which mode
        };
    }

    render() {
        let v = this.state.value;
        let disabled = this.state.disabled;
        const { type, inputMode } = this.state;
        if (type  === CONST_BOOLEAN) {
            return [
                getMathJax(this.state.prompt),
                <FormControlLabel disabled={disabled}
                                  value={true}
                                  control={<Radio color='action' checked={v === true}/>}
                                  onChange={async () => {
                                      this.onChange(true);
                                      await sleep(100);
                                      this.props.onBlur();
                                  }}
                                  label='True'/>,
                <FormControlLabel disabled={disabled}
                                  value={false}
                                  control={<Radio color='action' checked={v === false}/>}
                                  onChange={async () => {
                                      this.onChange(false);
                                      await sleep(100);
                                      this.props.onBlur();
                                  }}
                                  label='False'/>
            ];
        }
        else if (type === CONST_MULTIPLE_CHOICE) {
            let p = this.state.prompt.replace('不都', 'None of the above').replace('都', 'All of the above').split('—');
            return [
                getMathJax(p[0])].concat(p.slice(1).map((x, y) => [
                    <FormControlLabel control={<Radio color='action' checked={v === y.toString()}/>}
                                      disabled={disabled}
                                      onChange={async () => {
                                          this.onChange(y.toString());
                                          await sleep(100);
                                          this.props.onBlur();
                                      }}
                                      label={getMathJax(x)}/>,
                <br/>
                ])
            );
        }
        else if (type === CONST_NUMBER) {
            let message = validateNumber(v);
            return (
                <div>
                    {getMathJax(this.state.prompt)}
                    <TextField value={v}
                               onChange={(e) => this.onChange(e.target.value)}
                               onBlur={() => this.props.onBlur()}
                               error={!disabled && !Array.isArray(message)}
                               label='Enter number'
                               disabled={disabled}
                               helperText={!Array.isArray(message) ? message : undefined}/>
                    <br/>
                    <br/>
                    {Array.isArray(message) ? getMathJax('\\(' + message[0] + '\\)') : undefined}
                </div>
            );
        }
        else if (type === CONST_LINEAR_EXPRESSION) {
            return null;
        }
        else if (type === CONST_MANUAL_INPUT) {
            return null;
        }
        else if (type === CONST_MANUAL_INPUT_POLYNOMIAL) {
            return null;
        }
        else if (type === CONST_VECTOR) {
          if (inputMode === BUTTON_INPUT){
            return (
                <ButtonInput
                  type = {CONST_VECTOR}  // this is the type
                  disabled={disabled}  // this is whether the input is disabled
                  value={v}  // this is the value if a test is resumed
                  buttonSave={ this.props.buttonSave } // this essentially submits
                  onChange={this.props.onChange} // this is the onChange method that modifies the data
                />
            )
          }
          else if (inputMode === MANUAL_INPUT){
            let vector = validateVector(v);
            return (
                <div>
                    {getMathJax(this.state.prompt)}
                    <TextField disabled={disabled} value={v} label='Enter vector'
                               onChange={e => this.onChange(e.target.value)}
                               onBlur={() => this.props.onBlur()}
                               error={!disabled && !Array.isArray(vector)}
                               helperText={!Array.isArray(vector) ? vector : undefined}/>
                    <br/><br/>
                    {Array.isArray(vector) ? getMathJax('\\(\\begin{bmatrix}'
                        + vector.join('\\\\') + '\\end{bmatrix}\\)', 'body2') : undefined}
                </div>
            );
          }
        }
        else if (type === CONST_VECTOR_LINEAR_EXPRESSION) {
            return null;
        }
        else if (type === CONST_MATRIX) {
          if (inputMode === BUTTON_INPUT){
            return(
                <ButtonInput
                  type = {CONST_MATRIX}  // this is the type
                  disabled={disabled}  // this is whether the input is disabled
                  value={v}  // this is the value if a test is resumed
                  buttonSave={ this.props.buttonSave } // this essentially submits
                  onChange={this.props.onChange} // this is the onChange method that modifies the data
                  />
                )

          }
          else {
            let matrix = validateMatrix(v);
            return (
                <div>
                    {getMathJax(this.state.prompt)}
                    <TextField disabled={disabled}
                               multiline
                               value={v}
                               label='Enter matrix'
                               onChange={e => this.onChange(e.target.value)}
                               onBlur={() => this.props.onBlur()}
                               error={!disabled && !Array.isArray(matrix)}
                               helperText={!Array.isArray(matrix) ? matrix : undefined}/>
                    <br/><br/>
                    {Array.isArray(matrix) ? getMathJax('\\(\\begin{bmatrix}'
                        + matrix.map(x => x.join('&')).join('\\\\') + '\\end{bmatrix}\\)', 'body2') : undefined}
                </div>
            );
          }

        }
        else if (type === CONST_BASIS) {
            let basis = validateMatrix(v);
            return (
                <div>
                    {getMathJax(this.state.prompt)}
                    <TextField disabled={disabled} multiline value={v} label='Enter basis'
                               onChange={e => this.onChange(e.target.value)}
                               onBlur={() => this.props.onBlur()}
                               error={!disabled && !Array.isArray(basis)}
                               helperText={!Array.isArray(basis) ? basis : undefined}/>
                    <br/><br/>
                    {Array.isArray(basis) ? getMathJax('\\(\\left\\{' + basis.map(x => '\\begin{bmatrix}'
                        + x.join('\\\\') + '\\end{bmatrix}').join(',') + '\\right\\}\\)', 'body2') : undefined}
                </div>
            );
        }
        return <Typography variant='body2' color='error'>Invalid answer type</Typography>
    }

    onChange(value) {
        this.setState({value: value});
        this.props.onChange(value);
    }
}