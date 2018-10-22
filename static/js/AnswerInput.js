import React from 'react';
import {getMathJax, sleep, validateMatrix, validateNumber, validateVector} from './Utilities';
import Radio from '@material-ui/core/Radio/Radio';
import TextField from '@material-ui/core/TextField/TextField';
import Typography from '@material-ui/core/Typography/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';

export default class AnswerInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
            value: this.props.value,
            prompt: this.props.prompt,
            disabled: this.props.disabled,
        };
    }

    render() {
        let v = this.state.value;
        let disabled = this.state.disabled;
        if (this.state.type === '0') {
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
        } else if (this.state.type === '1') {
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
        } else if (this.state.type === '2') {
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
        } else if (this.state.type === '3') {
            return null;
        } else if (this.state.type === '4') {
            return null;
        } else if (this.state.type === '5') {
            return null;
        } else if (this.state.type === '6') {
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
        } else if (this.state.type === '7') {
            return null;
        } else if (this.state.type === '8') {
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
        } else if (this.state.type === '9') {
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