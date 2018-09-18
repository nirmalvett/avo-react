import React from 'react';
import TextField from "@material-ui/core/TextField/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/Radio/Radio";
import {getMathJax, validateMatrix, validateNumber, validateVector} from "./Utilities";

export default class AnswerInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type,
            value: this.props.value,
            prompt: this.props.prompt,
        };
    }

    render() {
        if (this.state.type === '0') {
            return [
                getMathJax(this.state.prompt),
                <FormControlLabel value={false} control={<Radio color="action"/>} label="False" labelPlacement="start"
                                  onChange={() => this.onChange(false)}/>,
                <FormControlLabel value={true} control={<Radio color="action"/>} label="True" labelPlacement="start"
                                  onChange={() => this.onChange(true)}/>
            ];
        } else if (this.state.type === '1') {
            let p = this.state.prompt.split('—');
            return [
                getMathJax(p[0])].concat(p.slice(1).map((x, y) =>
                <FormControlLabel control={<Radio color='action'/>} label={getMathJax(x)} labelPlacement='start'
                                  onChange={() => this.onChange(y)}/>)
            );
        } else if (this.state.type === '2') {
            let message = validateNumber(this.state.value);
            return (
                <div>
                    {getMathJax(this.state.prompt)}
                    <TextField value={this.state.value} onChange={(e) => this.onChange(e.target.value)}
                               error={!Array.isArray(message)} label='Enter number'
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
            let vector = validateVector(this.state.value);
            return (
                <div>
                    {getMathJax(this.state.prompt)}
                    <TextField value={this.state.value} label='Enter vector'
                               onChange={e => this.onChange(e.target.value)}
                               error={!Array.isArray(vector)} helperText={!Array.isArray(vector) ? vector : undefined}/>
                    <br/><br/>
                    {Array.isArray(vector) ? getMathJax('\\(\\begin{bmatrix}'
                        + vector.join('\\\\') + '\\end{bmatrix}\\)', 'body2') : undefined}
                </div>
            );
        } else if (this.state.type === '7') {
            return null;
        } else if (this.state.type === '8') {
            let matrix = validateMatrix(this.state.value);
            return (
                <div>
                    {getMathJax(this.state.prompt)}
                    <TextField multiline value={this.state.value} label='Enter matrix'
                               onChange={e => this.onChange(e.target.value)}
                               error={!Array.isArray(matrix)} helperText={!Array.isArray(matrix) ? matrix : undefined}/>
                    <br/><br/>
                    {Array.isArray(matrix) ? getMathJax('\\(\\begin{bmatrix}'
                        + matrix.map(x => x.join('&')).join('\\\\') + '\\end{bmatrix}\\)', 'body2') : undefined}
                </div>
            );
        } else if (this.state.type === '9') {
            let basis = validateMatrix(this.state.value);
            return (
                <div>
                    {getMathJax(this.state.prompt)}
                    <TextField multiline value={this.state.value} label='Enter basis'
                               onChange={e => this.onChange(e.target.value)}
                               error={!Array.isArray(basis)} helperText={!Array.isArray(basis) ? basis : undefined}/>
                    <br/><br/>
                    {Array.isArray(basis) ? getMathJax('\\(\\left\\{' + basis.map(x => '\\begin{bmatrix}'
                        + x.join('\\\\') + '\\end{bmatrix}').join(',') + '\\right\\}\\)', 'body2') : undefined}
                </div>
            );
        }
    }

    onChange(value) {
        this.setState({value: value});
        console.log(value);
        // this.props.onChange();
    }
}