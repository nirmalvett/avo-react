import React, {Component, Fragment} from 'react';
import Card from '@material-ui/core/Card';
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
    buildMathCode, buildPlainText, compile, extractReferences, formatString,
    formatStringForEditing, init, initOld, validateString, function_regex, FUNCTIONS
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
import Cancel from '@material-ui/icons/CancelOutlined';
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
            initError: 0,
            savedString: questionString,
            content: null,
            hints: {selectedFunction: "", currentFunctions: [], suggestedFunctions: []},
        }, questionString.split('；').length === 5 ? initOld(questionString) : init(questionString));

        let compileString = compile(this.state);
        if (questionString !== compileString) {
            this.state.initError = 1;
            Http.sampleQuestion(questionString, 0, undefined, result1 => {
                Http.sampleQuestion(compileString, 0, undefined, result2 => {
                    if (JSON.stringify(result1) !== JSON.stringify(result2)) {
                        console.log(JSON.stringify(result1));
                        console.log(JSON.stringify(result2));
                        this.setState({initError: 2});
                    }
                }, () => this.setState({initError: 2}))
            }, () => this.setState({initError: 2}));
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
            <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                {this.renderButtons()}
                <div style={{flex: 8, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                    <Card style={cardStyle}>{this.renderMathCard()}</Card>
                    <Divider style={dividerStyle}/>

                    <Card style={cardStyle}>{this.renderMainPromptCard()}</Card>
                    <Divider style={dividerStyle}/>

                    {this.state.editorPrompts.map((x, y) =>
                        <Card style={cardStyle} key={'prompt' + x.prompt + x.type + y}>
                            {this.renderSubPromptCard(x, y)}
                        </Card>
                    )}
                    <div style={{margin: 8}}>
                        <Button variant='outlined' style={{width: '100%'}} onClick={() => this.addPrompt()}>
                            Add Prompt
                        </Button>
                    </div>
                    <Divider style={dividerStyle}/>

                    {this.state.editorCriteria.map((x, y) =>
                        <Card style={cardStyle} key={'criteria' + x.points + x.criteria + x.explanation + y}>
                            {this.renderCriteriaCard(x, y)}
                        </Card>
                    )}
                    <div style={{margin: 8}}>
                        <Button variant='outlined' style={{width: '100%'}} onClick={() => this.addCriteria()}>
                            Add Criteria
                        </Button>
                    </div>

                </div>
                <div style={{flex: 4, display: 'flex', overflowY: 'auto'}}>
                    <Card style={{flex: 1, margin: '8%', padding: 20}}>
                        {renderHints(this.state.currentlyEditing)}
                    </Card>
                </div>
            </div>
        );
    }

    renderButtons() {
        let disableSave = compile(this.state) === this.state.savedString;
        let warning = [
            null,
            <IconButton disabled><Warning style={{color: '#ff8800'}}/></IconButton>,
            <IconButton disabled><Warning color='error'/></IconButton>,
        ][this.state.initError];
        if (this.state.currentlyEditing === 'PREVIEW')
            return (
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 5}}>
                    <IconButton onClick={() => this.returnToManager()}><ArrowBack/></IconButton>
                    <IconButton onClick={() => this.editorSave()} disabled={disableSave}><Save/></IconButton>
                    <IconButton onClick={() => this.cancel()}><Edit color='primary'/></IconButton>
                    <IconButton onClick={() => this.editorNewSeed()}><Refresh/></IconButton>
                    {warning}
                </div>
            );
        else
            return (
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 5}}>
                    <IconButton onClick={() => this.returnToManager()}><ArrowBack/></IconButton>
                    <IconButton onClick={() => this.editorSave()} disabled={disableSave}><Save/></IconButton>
                    <IconButton onClick={() => this.editorPreview()}><Assignment/></IconButton>
                    {warning}
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
                        <div>
                            <IconButton onClick={() => this.cancel()}><Cancel/></IconButton>
                            <IconButton disabled={errors.length > 0} onClick={() => this.saveMath()}><Done/></IconButton>
                        </div>
                    </div>
                    <div>
                        <TextField
                            multiline value={this.state.content} style={{width: '100%'}}
                            inputProps={{
                                onKeyDown: this.editMath.bind(this),
                                onClick: this.generateHints.bind(this),
                                onKeyUp: this.generateHints.bind(this),
                            }}
                            onChange={event => this.setState({content: event.target.value})}
                        />
                    </div>
                    <table><tbody>
                        {errors.map(error => <tr>
                            <td style={{padding: 2}}><Typography>Line {error[0]+1}</Typography></td>
                            <td style={{padding: 2}}>{error[1]}</td>
                        </tr>)}
                    </tbody></table>
                    <Typography>{this.getHints()}</Typography>
                </Fragment>
            );
        }
        else return (
            <Fragment>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Typography variant='title'>Math</Typography>
                    <IconButton onClick={() => this.startEditingMath()}><Edit/></IconButton>
                </div>
                {this.state.editorMath.map((x, y) => (
                    x.comment.length === 0
                        ? getMathJax('\\(\\small ' + x.varNames.join(', ') + '=' + x.LaTeX + '\\)', undefined, y)
                        : getMathJax('\\(\\small ' + x.varNames.join(', ') + '=' + x.LaTeX + '\\) # ' + x.comment, undefined, y)
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
                        <div>
                            <IconButton onClick={() => this.cancel()}><Cancel/></IconButton>
                            <IconButton disabled={errors.length > 0} onClick={() => this.saveMainPrompt()}>
                                <Done/>
                            </IconButton>
                        </div>
                    </div>
                    <div><TextField multiline value={this.state.content} style={{width: '100%'}}
                                    inputProps={{onKeyDown: QuestionBuilder.editText}}
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
                            <IconButton onClick={() => this.cancel()}><Cancel/></IconButton>
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
                        <MenuItem value='3'>Calculus Expression</MenuItem>
                        {/*<MenuItem value='5' disabled>Polynomial</MenuItem>*/}
                        <MenuItem value='6'>Vector</MenuItem>
                        <MenuItem value='5'>Vector (1229)</MenuItem>
                        <MenuItem value='7'>Vector with free variables</MenuItem>
                        <MenuItem value='8'>Matrix</MenuItem>
                        <MenuItem value='9'>Basis</MenuItem>
                    </Select></div>
                    <div>
                        <TextField multiline value={this.state.content.prompt} style={{width: '100%'}}
                                   inputProps={{onKeyDown: QuestionBuilder.editText}}
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
                        <AnswerInput disabled type={x.type} prompt={prompt}/>
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
                        <AnswerInput disabled type={x.type} prompt={prompt}/>
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
                            <IconButton onClick={() => this.cancel()}><Cancel/></IconButton>
                            <IconButton disabled={error || errors.length > 0}
                                        onClick={() => this.saveCriteria()}>
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
                            inputProps={{onKeyDown: QuestionBuilder.editText}}
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

    cancel() {
        this.setState({currentlyEditing: null});
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
                this.setState({sets, savedString: string, initError: 0});
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
        let {string, strings} = extractReferences(this.state.content, this.props.showSnackBar);
        this.setState({editorPrompt: {prompt: string, strings}, currentlyEditing: null});
    }

    saveSubPrompt() {
        let {string, strings} = extractReferences(this.state.content.prompt, this.props.showSnackBar);
        let {type} = this.state.content;
        let editorPrompts = copy(this.state.editorPrompts);
        editorPrompts[Number(this.state.currentlyEditing.slice(6))] = {prompt: string, strings, type};
        this.setState({editorPrompts, currentlyEditing: null});
    }

    saveCriteria() {
        let {string, strings} = extractReferences(this.state.content.explanation, this.props.showSnackBar);
        let {criteria, points} = this.state.content;
        let {mathCode, LaTeX} = buildMathCode(criteria);
        let expr = buildPlainText(mathCode)[0];
        let editorCriteria = copy(this.state.editorCriteria);
        editorCriteria[Number(this.state.currentlyEditing.slice(8))] =
            {expr, points, explanation: string, mathCode, LaTeX, strings};
        console.log(editorCriteria);
        this.setState({editorCriteria, currentlyEditing: null});
    }

    static editText(event) {
        let {key, ctrlKey, target} = event;
        if (ctrlKey && (key === 'd' || key === 'e')) {
            let {selectionStart, selectionEnd} = target;
            event.preventDefault();
            document.execCommand('insertText', false, key === 'e'
                ? '\\[' + target.value.substring(selectionStart, selectionEnd) + '\\]'
                : '\\(' + target.value.substring(selectionStart, selectionEnd) + '\\)'
            );
            target.selectionStart = selectionStart + 2;
            target.selectionEnd = selectionEnd + 2;
        }
    }

    editMath(event) {
        let {target} = event;
        let hints = {
            functions: [],
            currentFunctions: [],
            selectedFunction: "",
            errors: [],
            suggestedFunctions: this.state.hints.suggestedFunctions
        };

		let {selectionStart, selectionEnd} = target;
        let content = target.value;
        let match = new RegExp(function_regex + "$").exec(content.substr(0, selectionStart) + '(');
        let args = match === null ? "" : FUNCTIONS[match[0].slice(0, -1)][3];
        if (event.key === "(") {
            event.preventDefault();
            document.execCommand('insertText', false, "(" + args + ")");
            content = content.substr(0, selectionStart) + "(" + args + ")" + content.substr(selectionStart);
            selectionEnd = (selectionStart += 1) + args.length;
        } else if (event.key === "[") {
            event.preventDefault();
            document.execCommand('insertText', false, "[]");
            content = content.substr(0, selectionStart) + "[]" + content.substr(selectionStart);
            selectionEnd = selectionStart += 1;
        } else if (event.key === "{") {
            event.preventDefault();
            document.execCommand('insertText', false, "{}");
            content = content.substr(0, selectionStart) + "{}" + content.substr(selectionStart);
            selectionEnd = selectionStart += 1;
        }
        let string = content;
        let function_regex2 = new RegExp(function_regex, "g");
        for (let m = function_regex2.exec(string); m !== null; m = function_regex2.exec(string)) {
            let fn = m[0].slice(0, -1);
            let fnStart = m.index + m[0].length;
            let fnStop = m.index + m[0].length;
            let arg = 0;
            for (let brackets = 1; brackets > 0 && fnStop < selectionStart; fnStop++) {
                if (brackets === 1 && string[fnStop] === "," && fnStop < selectionStart)
                    arg++;
                else if ("([{".includes(string[fnStop]))
                    brackets++;
                else if (")]}".includes(string[fnStop]))
                    brackets--;
                if (brackets === 0)
                    arg = -1;
            }
            if (m.index <= selectionStart && selectionStart < m.index + m[0].length)
                hints.selectedFunction = fn;
            else if (fnStart <= selectionStart && arg >= 0)
                hints.currentFunctions.push([fn, arg]);
        }
        this.setState({content, hints}, () => {
            target.selectionStart = selectionStart;
            target.selectionEnd = selectionEnd;
        });
    }

    generateHints(event) {
        let {target} = event;
		this.hints = {functions: [], currentFunctions: [], selectedFunction: "", errors: [], suggestedFunctions: []};

		let {selectionStart} = target;
        let string = target.value;

        let x = selectionStart;
        while (/\w/.test(string.substr(x-1, 1))) x--;
        let y = selectionStart;
        while (/\w/.test(string.substr(y, 1))) y++;
        let f = string.substring(x, y);
        if (f.length > 2)
            for(let i in FUNCTIONS) if (FUNCTIONS.hasOwnProperty(i)) if (i.includes(f) && i !== f)
                this.hints.suggestedFunctions.push(i);

        let function_regex2 = new RegExp(function_regex, "g");
        for (let m = function_regex2.exec(string); m !== null; m = function_regex2.exec(string)) {
            let fn = m[0].slice(0, -1);
            let fnStart = m.index + m[0].length;
            let fnStop = m.index + m[0].length;
            let arg = 0;
            for (let brackets = 1; brackets > 0 && fnStop < selectionStart; fnStop++) {
                if (brackets === 1 && string[fnStop] === "," && fnStop < selectionStart)
                    arg++;
                else if ("([{".includes(string[fnStop]))
                    brackets++;
                else if (")]}".includes(string[fnStop]))
                    brackets--;
                if (brackets === 0)
                    arg = -1;
            }
            if (m.index <= selectionStart && selectionStart < m.index + m[0].length)
                this.hints.selectedFunction = fn;
            else if (fnStart <= selectionStart && arg >= 0)
                this.hints.currentFunctions.push([fn, arg]);
        }
        this.setState({hints: this.hints});
    }

    getHints() {
        let str = [];

        let {hints} = this.state;
        hints.functions = [];
		for (let i = 0; i < hints.currentFunctions.length; i++) {
			let fn = hints.currentFunctions[i];
			let args = FUNCTIONS[fn[0]][3].split(",").map(x => x.trim());
			// noinspection CheckTagEmptyBody
			args[fn[1]] = <strong style={{color: '#399103'}}>{args[fn[1]]}</strong>;
			str.push(
			    <Fragment>
                    {fn[0]}({args.map((x, y) => (
                        <Fragment>
                            {y === 0 ? null : ', '}{x}
                        </Fragment>
                    ))})
			    </Fragment>
            );
			hints.functions = hints.functions.filter(x => x !== fn[0])
		}

		if (hints.selectedFunction !== "") {  // Adds a function to the list if the cursor was on the title
			// noinspection CheckTagEmptyBody
            str.push(
                <Fragment>
                    {hints.selectedFunction}
                    (<span style={{color: '#399103'}}>{FUNCTIONS[hints.selectedFunction][3]}</span>)
                </Fragment>
            );
		}

		return (
		    <Fragment>
                {str.map((x, y) => (
                    <Fragment key={y}>
                        <br/>
                        {x}
                    </Fragment>
                ))}
                {hints.functions.map(x => (
                    <Fragment>
                        <br/>
                        {x}({FUNCTIONS[x][3]})
                    </Fragment>
                ))}
                <br/>
                {hints.suggestedFunctions.join(', ')}
            </Fragment>
        );
    }
}

QuestionBuilder.propTypes = {
    initManager: func.isRequired,
    initWith: object.isRequired,
};
