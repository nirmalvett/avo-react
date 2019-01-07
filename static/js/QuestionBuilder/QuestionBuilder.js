import React, {Component, Fragment} from 'react';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/es/TextField/TextField';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Http from '../Http';
import {copy, getMathJax} from '../Utilities';
import {
    buildMathCode, buildPlainText, compile, extractReferences,
    formatString, formatStringForEditing, initOld, validateString,
} from './QuestionBuilderUtils';
import AnswerInput from '../AVOAnswerInput/AnswerInput';
import Done from '@material-ui/icons/Done';
import Edit from '@material-ui/icons/Edit';
import Save from '@material-ui/icons/Save';
import Delete from '@material-ui/icons/Delete';
import Refresh from '@material-ui/icons/Refresh';
import Warning from '@material-ui/icons/Warning';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Assignment from '@material-ui/icons/Assignment';
import {object, func} from "prop-types";
import {Preview, renderHints} from "./QuestionBuilderRender";

export default class QuestionBuilder extends Component {
    constructor(props) {
        super(props);
        let {initWith} = this.props;
        let questionString = initWith.sets[initWith.selectedS].questions[initWith.selectedQ].string.toString();

        this.state = Object.assign({
            selectedS: initWith.selectedS, // Selected Set
            selectedQ: initWith.selectedQ, // Selected Question
            sets: initWith.sets,
            preview: {},
            currentlyEditing: null,
            editorSeed: Math.round(65536*Math.random()),
            initError: false,
            savedString: questionString,
            content: null,
        }, initOld(questionString));

        let compileString = compile(this.state);
        if (questionString !== compileString) {
            this.state.initError = true;
            console.log("Warning: This question could not be recompiled to its initial state." +
                " Check the diff below before saving.");
            console.log("Server: " + questionString);
            console.log("Local:  " + compileString);
        }
    }

    render() {
        if (this.state.currentlyEditing === 'PREVIEW') {
            return (
                <Fragment>
                    {this.renderButtons()}
                    <Preview state={this.state}/>
                </Fragment>
            );
        }
        let cardStyle = {margin: 8, paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10};
        let dividerStyle = {marginTop: 15, marginBottom: 15};
        return (
            <Fragment>
                {this.renderButtons()}
                <Grid container spacing={8} style={{flex: 1, margin: 0}}>
                    <Grid item xs={8} style={{flex: 1, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                        <Card style={cardStyle}>{this.renderMathCard()}</Card>
                        <Divider style={dividerStyle}/>

                        <Card style={cardStyle}>{this.renderMainPromptCard()}</Card>
                        <Divider style={dividerStyle}/>

                        {this.state.editorPrompts.map(
                            (x, y) => <Card style={cardStyle}>{this.renderSubPromptCard(x, y)}</Card>
                        )}
                        <div style={{margin: 8}}>
                            <Button variant='outlined' style={{width: '100%'}} onClick={() => this.addPrompt()}>
                                Add Prompt
                            </Button>
                        </div>
                        <Divider style={dividerStyle}/>

                        {this.state.editorCriteria.map(
                            (x, y) => <Card style={cardStyle}>{this.renderCriteriaCard(x, y)}</Card>
                        )}
                        <div style={{margin: 8}}>
                            <Button variant='outlined' style={{width: '100%'}} onClick={() => this.addCriteria()}>
                                Add Criteria
                            </Button>
                        </div>

                    </Grid>
                    <Grid item xs={4} style={{flex: 1, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                        <Card style={{flex: 1, margin: '8%', padding: 20}}>
                            {renderHints(this.state.currentlyEditing)}
                        </Card>
                    </Grid>
                </Grid>
            </Fragment>
        );
    }

    renderButtons() {
        let disableSave = compile(this.state) === this.state.savedString;
        if (this.state.currentlyEditing === 'PREVIEW')
            return (
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 5}}>
                    <IconButton onClick={() => this.returnToManager()}><ArrowBack/></IconButton>
                    <IconButton onClick={() => this.editorSave()} disabled={disableSave}><Save/></IconButton>
                    <IconButton onClick={() => this.setState({currentlyEditing: null})}><Edit color='primary'/></IconButton>
                    <IconButton onClick={() => this.editorNewSeed()}><Refresh/></IconButton>
                    {this.state.initError ? <IconButton disabled><Warning color='error'/></IconButton> : null}
                </div>
            );
        else
            return (
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 5}}>
                    <IconButton onClick={() => this.returnToManager()}><ArrowBack/></IconButton>
                    <IconButton onClick={() => this.editorSave()} disabled={disableSave}><Save/></IconButton>
                    <IconButton onClick={() => this.editorPreview()}><Assignment/></IconButton>
                    {this.state.initError ? <IconButton disabled><Warning color='error'/></IconButton> : null}
                </div>
            );
    }

    renderMathCard() {
        if (this.state.currentlyEditing === 'math') {
            let errors = [];
            let lines = this.state.content.split('\n').filter(x => x.trim().length !== 0);
            for(let i=0; i<lines.length; i++) {
                let match = /^([^=]+)=([^#]+)(?:#(.*))?$/.exec(lines[i]);
                if (match === null)
                    errors.push([i, <Typography color='error'>Line isn't an equation</Typography>]);
                else {
                    let varNames = match[1].split(',').map(x => x.trim());
                    let invalidVarNames = varNames.filter(x => !/^\$\w+$/.test(x));
                    if (invalidVarNames.length > 0)
                        errors.push([i, <Typography color='error'>The following variable names are
                            invalid: {invalidVarNames.map(x => "'" + x + "'").join(", ")}</Typography>]);
                    let mc = buildMathCode(match[2]);
                    if (mc !== undefined && mc.mathCode === undefined)
                        errors.push([i, mc]);
                }
            }
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Math</Typography>
                        <IconButton disabled={errors.length > 0} onClick={() => this.saveMath()}><Done/></IconButton>
                    </div>
                    <div><TextField multiline value={this.state.content} style={{width: '100%'}}
                                    onChange={event => this.setState({content: event.target.value})}/></div>
                    <table>
                        {errors.map(error => <tr>
                            <td style={{padding: 2}}><Typography>Line {error[0]+1}</Typography></td>
                            <td style={{padding: 2}}>{error[1]}</td>
                        </tr>)}
                    </table>
                </Fragment>
            );
        }
        else return (
            <Fragment>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant='title'>Math</Typography>
                    <IconButton onClick={() => this.startEditingMath()}><Edit/></IconButton>
                </div>
                {this.state.editorMath.map(x => (
                    x.comment.length === 0
                        ? getMathJax('\\(\\small ' + x.varNames.join(', ') + '=' + x.LaTeX + '\\)')
                        : getMathJax('\\(\\small ' + x.varNames.join(', ') + '=' + x.LaTeX + '\\) # ' + x.comment)
                ))}
            </Fragment>
        );
    }

    renderMainPromptCard() {
        if (this.state.currentlyEditing === 'mainPrompt') {
            let errors = validateString(this.state.content);
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Main Prompt</Typography>
                        <IconButton disabled={errors.length > 0}
                                    onClick={() => this.saveMainPrompt()}><Done/></IconButton>
                    </div>
                    <div><TextField multiline value={this.state.content} style={{width: '100%'}}
                                    onChange={v => this.setState({content: v.target.value})}/></div>
                    {errors}
                </Fragment>
            );
        }
        else {
            let {editorPrompt} = this.state;
            if (editorPrompt.strings) {
                return (
                    <Fragment>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant='title'>Main Prompt</Typography>
                            <IconButton onClick={() => this.startEditingMainPrompt()}><Edit/></IconButton>
                        </div>
                        {getMathJax(formatString(editorPrompt.prompt, editorPrompt.strings))}
                    </Fragment>
                );
            } else {
                return (
                    <Fragment>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant='title'>Main Prompt</Typography>
                            <IconButton onClick={() => this.startEditingMainPrompt()}><Edit/></IconButton>
                        </div>
                        {getMathJax(editorPrompt.prompt)}
                        <Typography>{editorPrompt.errors}</Typography>
                    </Fragment>
                );
            }
        }
    }

    renderSubPromptCard(x, y) {
        if (this.state.currentlyEditing === 'prompt' + y) {
            let errors = validateString(this.state.content.prompt);
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Prompt {y + 1}</Typography>
                        <div>
                            <IconButton onClick={() => {
                                let prompts = copy(this.state.editorPrompts);
                                prompts.splice(Number(this.state.currentlyEditing.slice(6)), 1);
                                this.setState({editorPrompts: prompts, currentlyEditing: null});
                            }}>
                                <Delete/></IconButton>
                            <IconButton disabled={errors.length > 0}
                                        onClick={() => this.saveSubPrompt()}><Done/></IconButton>
                        </div>
                    </div>
                    <div><Select value={this.state.content.type} style={{width: '100%'}}
                                 onChange={v => this.setState(
                                     {content: {type: v.target.value, prompt: this.state.content.prompt}}
                                 )}
                    >
                        <MenuItem value='0'>True/false</MenuItem>
                        <MenuItem value='1'>Multiple choice</MenuItem>
                        <MenuItem value='2'>Number</MenuItem>
                        {/*<MenuItem value='5' disabled>Polynomial</MenuItem>*/}
                        <MenuItem value='6'>Vector</MenuItem>
                        <MenuItem value='7'>Vector with free variables</MenuItem>
                        <MenuItem value='8'>Matrix</MenuItem>
                        <MenuItem value='9'>Basis</MenuItem>
                    </Select></div>
                    <div>
                        <TextField multiline value={this.state.content.prompt} style={{width: '100%'}}
                                   onChange={v => this.setState(
                                       {content: {type: this.state.content.type, prompt: v.target.value}}
                                   )}
                        />
                    </div>
                    {errors}
                </Fragment>
            );
        } else {
            if (x.strings) {
                let prompt = formatString(x.prompt, x.strings);
                return (
                    <Fragment>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant='title'>Prompt {y + 1}</Typography>
                            <IconButton onClick={() => this.startEditingSubPrompt(y)}><Edit/></IconButton>
                        </div>
                        <AnswerInput key={prompt + x.type} disabled type={x.type} prompt={prompt}/>
                    </Fragment>
                );
            } else {
                let prompt = x.prompt;
                return (
                    <Fragment>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant='title'>Prompt {y + 1}</Typography>
                            <IconButton onClick={() => this.startEditingSubPrompt(y)}><Edit/></IconButton>
                        </div>
                        <AnswerInput key={prompt + x.type} disabled type={x.type} prompt={prompt}/>
                    </Fragment>
                );
            }
        }
    }

    renderCriteriaCard(x, y) {
        if (this.state.currentlyEditing === 'criteria' + y) {
            let {points, criteria, explanation} = this.state.content;
            let error = buildMathCode(criteria);
            error = (error.mathCode === undefined) ? error : undefined;
            let errors = validateString(explanation);
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Criteria {y + 1}</Typography>
                        <div>
                            <IconButton onClick={() => {
                                let criteria = copy(this.state.editorCriteria);
                                criteria.splice(Number(this.state.currentlyEditing.slice(8)), 1);
                                this.setState({editorCriteria: criteria, currentlyEditing: null});
                            }}><Delete/></IconButton>
                            <IconButton onClick={() => this.saveCriteria()}>
                                <Done/></IconButton>
                        </div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <TextField
                            value={points} style={{width: '8%'}} label='Points'
                            onChange={v => this.setState(
                                {content: {points: v.target.value, criteria, explanation}}
                            )}
                        />
                        <TextField
                            value={criteria} style={{width: '90%'}} label='Expression'
                            onChange={v => this.setState(
                                {content: {points, criteria: v.target.value, explanation}}
                            )}
                            helperText={error}
                        />
                    </div>
                    <div style={{marginTop: 10}}>
                        <TextField
                            multiline value={explanation} style={{width: '100%'}} label='Explanation'
                            onChange={v => this.setState(
                                {content: {points, criteria, explanation: v.target.value}}
                            )}
                        />
                    </div>
                    {errors}
                </Fragment>
            );
        }
        else
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Criteria {y + 1} ({x.points} points)</Typography>
                        <IconButton onClick={() => this.startEditingCriteria(y)}>
                            <Edit/></IconButton>
                    </div>
                    {getMathJax('\\(' + x.LaTeX + '\\)')}
                    {getMathJax(formatString(x.explanation, x.strings))}
                </Fragment>
            );
    }

    returnToManager() {
        let {selectedS, selectedQ, sets} = this.props.initWith;
        this.props.initManager([selectedS, selectedQ, sets]);
    }

    editorSave() {
        let id = this.state.sets[this.state.selectedS].questions[this.state.selectedQ].id;
        let answers = this.state.editorPrompts.length;
        let total = this.state.editorCriteria.map(x => Number(x.points)).reduce((x,y) => x+y, 0);
        let string = compile(this.state);
        Http.editQuestion(id, string, answers, total,
            () => {
                let sets = copy(this.state.sets);
                sets[this.state.selectedS].questions[this.state.selectedQ].string = string;
                this.setState({sets, savedString: string, initError: false});
            },
            (result) => {
                alert("The question couldn't be saved.");
                console.warn(result)
            }
        );
    }

    editorPreview() {
        Http.sampleQuestion(compile(this.state), this.state.editorSeed, undefined,result => {
            this.setState({currentlyEditing: 'PREVIEW', preview: result});
        });
    }

    editorNewSeed() {
        let seed = Math.round(65536*Math.random());
        Http.sampleQuestion(compile(this.state), seed, undefined,result => {
            this.setState({preview: result, editorSeed: seed});
        });
    }

    addPrompt() {
        let editorPrompts = copy(this.state.editorPrompts);
        let editing = 'prompt' + editorPrompts.length;
        editorPrompts.push({type: '0', prompt: '', strings: []});
        this.setState({editorPrompts, currentlyEditing: editing, content: {type: '0', prompt: ''}});
    }

    addCriteria() {
        let editorCriteria = copy(this.state.editorCriteria);
        let editing = 'criteria' + editorCriteria.length;
        editorCriteria.push({expr: 'true', points: 1, explanation: '', mathCode: '*T', LaTeX: '\\color{green}✔', strings: []});
        this.setState({editorCriteria, content: {points: '1', criteria: '', explanation: ''}, currentlyEditing: editing});
    }

    startEditingMath() {
        let content = this.state.editorMath.map(x => {
            if (x.text)
                return x.text;
            if (x.comment.length === 0)
                return x.varNames + ' = ' + x.expr;
            return x.varNames + ' = ' + x.expr + ' # ' + x.comment;
        }).join('\n');
        this.setState({content, currentlyEditing: 'math'});
    }

    startEditingMainPrompt() {
        let {editorPrompt} = this.state;
        this.setState({
            currentlyEditing: 'mainPrompt',
            content: formatStringForEditing(editorPrompt.prompt, editorPrompt.strings),
        });
    }

    startEditingSubPrompt(index) {
        let prompt = this.state.editorPrompts[index];
        this.setState({
            currentlyEditing: 'prompt' + index,
            content: {
                type: prompt.type,
                prompt: formatStringForEditing(prompt.prompt, prompt.strings),
            },
        });
    }

    startEditingCriteria(index) {
        let criteria = this.state.editorCriteria[index];
        this.setState({
            currentlyEditing: 'criteria' + index,
            content: {
                points: criteria.points,
                criteria: criteria.expr,
                explanation: formatStringForEditing(criteria.explanation, criteria.strings)
            },
        });
    }

    saveMath() {
        let lines = this.state.content.split('\n').filter(x => x.trim().length !== 0);
        let editorMath = lines.map(x => {
            let match = /^([^=]+)=([^#]+)(?:#(.*))?$/.exec(x);
            let varNames = match[1].split(',').map(x => x.trim());
            let {mathCode, LaTeX} = buildMathCode(match[2]);
            return {
                varNames,
                expr: buildPlainText(mathCode),
                mathCode,
                LaTeX,
                comment: match[3] === undefined ? '' : match[3].trim()
            };
        });
        this.setState({currentlyEditing: null, editorMath});
    }

    saveMainPrompt() {
        let {string, strings} = extractReferences(this.state.content);
        this.setState({editorPrompt: {prompt: string, strings}, currentlyEditing: null});
    }

    saveSubPrompt() {
        let {string, strings} = extractReferences(this.state.content.prompt);
        let {type} = this.state.content;
        let editorPrompts = copy(this.state.editorPrompts);
        editorPrompts[Number(this.state.currentlyEditing.slice(6))] = {prompt: string, strings, type};
        this.setState({editorPrompts, currentlyEditing: null});
    }

    saveCriteria() {
        let {string, strings} = extractReferences(this.state.content.explanation);
        let {criteria, points} = this.state.content;
        let {mathCode, LaTeX} = buildMathCode(criteria);
        let expr = buildPlainText(mathCode)[0];
        let editorCriteria = copy(this.state.editorCriteria);
        editorCriteria[Number(this.state.currentlyEditing.slice(8))] =
            {expr, points, explanation: string, mathCode, LaTeX, strings};
        console.log(editorCriteria);
        this.setState({editorCriteria, currentlyEditing: null});
    }
}

QuestionBuilder.propTypes = {
    initManager: func.isRequired,
    initWith: object.isRequired,
};
