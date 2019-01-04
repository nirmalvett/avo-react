import React, {Component, Fragment} from 'react';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Http from './Http';
import {copy, getMathJax} from './Utilities';
import {buildMathCode, buildPlainText, formatString, strNotation, varNotation} from './QuestionBuilderUtils';
import AnswerInput from './AVOAnswerInput/AnswerInput';
import Done from '@material-ui/icons/Done';
import Edit from '@material-ui/icons/Edit';
import Save from '@material-ui/icons/Save';
import Delete from '@material-ui/icons/Delete';
import Refresh from '@material-ui/icons/Refresh';
import Warning from '@material-ui/icons/Warning';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Assignment from '@material-ui/icons/Assignment';
import {object, func} from "prop-types";

export default class QuestionBuilder extends Component {
    constructor(props) {
        super(props);
        let {initWith} = this.props;
        // let string = initWith.sets[initWith.selectedS].questions[initWith.selectedQ].string.toString();
        // let sections = string.split('；').map(x => x.split('，'));
        // let math = sections[0];
        // let types = sections[2];
        // let comments = sections[4].map(x => x.length === 0 ? x : (' # ' + x));
        //
        // let editorMath = [];
        // while (math.length !== 0 && !math[0].includes('_') && !math[0].endsWith('%'))
        //     editorMath.push(buildPlainText(math.splice(0, 1)[0])[0] + comments.splice(0, 1)[0]);
        //
        // let stringEquations = [];
        // while (math.length !== 0 && !math[0].includes('%'))
        //     stringEquations.push(buildPlainText(math.splice(0,1)[0])[0]);
        //
        // let prompts = sections[1].map(x => varNotation(x, stringEquations));
        // let explanations = sections[3].map(x => varNotation(x, stringEquations));
        //
        // let editorCriteria = [];
        // while (math.length !== 0) {
        //     let match = /^(.*?) (\d+(?:\.\d+)?) %$/.exec(math.splice(0, 1)[0]);
        //     editorCriteria.push({
        //         points: match[2],
        //         criteria: buildPlainText(match[1])[0],
        //         explanation: explanations.splice(0, 1)[0]
        //     });
        // }

        this.state = {
            selectedS: initWith.selectedS, // Selected Set
            selectedQ: initWith.selectedQ, // Selected Question
            sets: initWith.sets,
            preview: {},
            editorMath: [
                {varName: '1', expr: '$1=1+1', LaTeX: '1+1', comment: '123'},
                {varName: '2', expr: '2+2', LaTeX: '2+2', comment: ''},
            ],
            editorPrompt: {
                prompt: 'This is the main prompt, it contains \\(<0>\\).',
                strings: [
                    {expr: '$1', LaTeX: '$1'},
                    // {expr: '/', error: 'Missing first operand for /'}
                ]
            },
            editorPrompts: [
                {
                    type: '2',
                    prompt: 'This is the 1st sub-prompt, it contains \\(<0>\\).',
                    strings: [
                        {expr: '$1', LaTeX: '$1'},
                        // {expr: '/', error: 'Missing first operand for /'}
                    ]
                },
                {
                    type: '6',
                    prompt: 'This is the 2nd sub-prompt, it contains \\(<0>\\) and \\(<1>\\).',
                    strings: [
                        {expr: '$1', LaTeX: '$1'},
                        {expr: '123', LaTeX: '123'}
                    ]
                }
            ],
            editorCriteria: [
                {
                    expr: '1=1',
                    points: '1',
                    explanation: '',
                    LaTeX: '1=1',
                    strings: [],
                },
                {
                    expr: '2=2',
                    points: '2',
                    explanation: '/You got it right!',
                    LaTeX: '2=2',
                    strings: [],
                },
            ],
            currentlyEditing: null,
            editorSeed: Math.round(65536*Math.random()),
            initError: false,
            savedString: string,
        };

        // let initString = string.substr(0, string.lastIndexOf('；'));
        // let compileString = this.compile();
        // compileString = compileString.substr(0, compileString.lastIndexOf('；'));
        // if (initString !== compileString) {
        //     this.state.initError = true;
        //     console.log("Warning: This question could not be recompiled to its initial state." +
        //         " Check the diff below before saving.");
        //     console.log("Server: " + initString);
        //     console.log("Local:  " + compileString);
        // }
    }

    render() {
        let cardStyle = {margin: 8, paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10};
        let dividerStyle = {marginTop: 15, marginBottom: 15};
        if (this.state.currentlyEditing === 'PREVIEW')
            return (
                <Fragment>
                    {this.renderButtons()}
                    <Grid container spacing={8} style={{flex: 1, margin: 0}}>
                        <Grid item xs={8} style={{flex: 1, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                            <Card style={cardStyle}>
                                <Typography variant='title' style={{marginTop: 10, marginBottom: 10}}>Math</Typography>
                                {this.renderMathCard()}
                                <Divider style={dividerStyle}/>
                                {this.state.preview.variables.map(
                                    (x, y) => getMathJax('\\($' + (y+1) + '=' + x + '\\)')
                                )}
                            </Card>
                            <Card style={cardStyle}>
                                {getMathJax(this.state.preview.prompt)}
                                {this.state.editorPrompts.map((x, y) =>
                                    <Fragment>
                                        <Divider style={dividerStyle}/>
                                        <AnswerInput type={x.type} disabled prompt={this.state.preview.prompts[y]}/>
                                    </Fragment>
                                )}
                            </Card>
                            <Card style={cardStyle}>
                                {this.state.editorCriteria.map((x, y) =>
                                    <Fragment>
                                        {y > 0 ? <Divider style={dividerStyle}/> : null}
                                        {getMathJax(this.state.preview.explanation[y])}
                                    </Fragment>
                                )}
                            </Card>
                        </Grid>
                        <Grid item xs={4} style={{flex: 1, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                            <Card style={{flex: 1, margin: '8%', padding: 20}}>
                                <Typography>
                                    This is preview mode! It lets you see the contents of all the variables
                                    you set, as well as what all the prompts and explanations will look like
                                    when students see them. If you ever get lost using the question builder,
                                    just click the preview button to come back here and see what your changes
                                    are doing!
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Fragment>
            );
        return (
            <Fragment>
                {/*{this.renderButtons()}*/}
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
                            <Button variant='outlined'
                                    style={{width: '100%'}}
                                    onClick={() => this.addPrompt()}
                            >
                                Add Prompt
                            </Button>
                        </div>
                        <Divider style={dividerStyle}/>

                        {this.state.editorCriteria.map(
                            (x, y) => <Card style={cardStyle}>{this.renderCriteriaCard(x, y)}</Card>
                        )}
                        <div style={{margin: 8}}>
                            <Button
                                variant='outlined'
                                style={{width: '100%'}}
                                onClick={() => this.addCriteria()}
                            >
                                Add Criteria
                            </Button>
                        </div>

                    </Grid>
                    <Grid item xs={4} style={{flex: 1, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                        <Card style={{flex: 1, margin: '8%', padding: 20}}>
                            {this.renderHints()}
                        </Card>
                    </Grid>
                </Grid>
            </Fragment>
        );
    }

    renderButtons() {
        let disableSave = this.compile() === this.state.savedString;
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
        if (this.state.currentlyEditing === 'math')
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Math</Typography>
                        <IconButton onClick={() => this.setState({currentlyEditing: null})}>
                            <Done/></IconButton>
                    </div>
                    <div><TextField multiline value={this.state.editorMath} style={{width: '100%'}}
                                    onChange={v => this.setState({editorMath: v.target.value})}/></div>
                </Fragment>
            );
        else if (this.state.currentlyEditing === 'PREVIEW') {
            let steps = this.state.editorMath.split('\n');
            steps = steps.map(x => {
                let result = /([^#]+)(?:#(.*))?/.exec(x);
                // noinspection JSValidateTypes
                if (result === null)
                    return <Typography color='error'>{x}</Typography>;
                if (result[2] === undefined)
                    return getMathJax('\\(\\small ' + buildMathCode(result[1])[2] + "\\)");
                return getMathJax('\\(\\small ' + buildMathCode(result[1])[2]
                    + "\\color{grey}{\\text{ # " + result[2] + "}}\\)");
            });
            return steps;
        } else {
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Math</Typography>
                        <IconButton onClick={() => this.setState({currentlyEditing: 'math'})}>
                            <Edit/></IconButton>
                    </div>
                    {this.state.editorMath.map(x => {
                        if (x.text)
                            return <p>{x.text}</p>;
                        if (x.error)
                            return (
                                <Fragment>
                                    <p>{x.varName} = {x.expr}<span color='#ff0000'>{'\t' + x.error}</span></p>
                                </Fragment>
                            );
                        return (
                            <Fragment>
                                {getMathJax('\\(\\small ' + x.varName + '=' + x.LaTeX + '\\)')}
                                <span color='#808080'>{x.comment}</span>
                            </Fragment>
                        );
                    })}
                </Fragment>
            );
        }
    }

    renderMainPromptCard() {
        if (this.state.currentlyEditing === 'mainPrompt')
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Main Prompt</Typography>
                        <IconButton onClick={() => this.setState({currentlyEditing: null})}>
                            <Done/></IconButton>
                    </div>
                    <div><TextField multiline value={this.state.editorPrompt} style={{width: '100%'}}
                                    onChange={v => this.setState({editorPrompt: v.target.value})}/></div>
                </Fragment>
            );
        else {
            let {editorPrompt} = this.state;
            if (editorPrompt.strings) {
                return (
                    <Fragment>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant='title'>Main Prompt</Typography>
                            <IconButton onClick={() => this.setState({currentlyEditing: 'mainPrompt'})}>
                                <Edit/></IconButton>
                        </div>
                        {getMathJax(formatString(editorPrompt.prompt, editorPrompt.strings))}
                    </Fragment>
                );
            } else {
                return (
                    <Fragment>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant='title'>Main Prompt</Typography>
                            <IconButton onClick={() => this.setState({currentlyEditing: 'mainPrompt'})}>
                                <Edit/></IconButton>
                        </div>
                        {getMathJax(editorPrompt.prompt)}
                    </Fragment>
                );
            }
        }
    }

    renderSubPromptCard(x, y) {
        if (this.state.currentlyEditing === 'prompt' + y) {
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
                            <IconButton onClick={() => this.setState({currentlyEditing: null})}>
                                <Done/></IconButton>
                        </div>
                    </div>
                    <div><Select value={x.type} style={{width: '100%'}}
                                 onChange={v => this.updateSubPrompt(y, v.target.value, x.prompt)}>
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
                        <TextField multiline value={x.prompt.replace(/—/g, '\n\n')} style={{width: '100%'}}
                                   onChange={v => this.updateSubPrompt(y, x.type, v.target.value)}/>
                    </div>
                </Fragment>
            );
        } else {
            if (x.strings) {
                let prompt = formatString(x.prompt, x.strings);
                return (
                    <Fragment>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant='title'>Prompt {y + 1}</Typography>
                            <IconButton onClick={() => this.setState({currentlyEditing: 'prompt' + y})}>
                                <Edit/></IconButton>
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
                            <IconButton onClick={() => this.setState({currentlyEditing: 'prompt' + y})}>
                                <Edit/></IconButton>
                        </div>
                        <AnswerInput key={prompt + x.type} disabled type={x.type} prompt={prompt}/>
                    </Fragment>
                );
            }
        }
    }

    renderCriteriaCard(x, y) {
        if (this.state.currentlyEditing === 'criteria' + y)
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Criteria {y+1}</Typography>
                        <div>
                            <IconButton onClick={() => {
                                let criteria = copy(this.state.editorCriteria);
                                criteria.splice(Number(this.state.currentlyEditing.slice(8)), 1);
                                this.setState({editorCriteria: criteria, currentlyEditing: null});
                            }}><Delete/></IconButton>
                            <IconButton onClick={() => this.setState({currentlyEditing: null})}>
                                <Done/></IconButton>
                        </div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <TextField value={x.points} style={{width: '8%'}} label='Points'
                                   onChange={v => this.updateCriteria(y, x.criteria, v.target.value, x.explanation)}/>
                        <TextField value={x.criteria} style={{width: '90%'}} label='Expression'
                                   onChange={v => this.updateCriteria(y, v.target.value, x.points, x.explanation)}/>
                    </div>
                    <div style={{marginTop: 10}}>
                        <TextField multiline value={x.explanation} style={{width: '100%'}} label='Explanation'
                                   onChange={v => this.updateCriteria(y, x.criteria, x.points, v.target.value)}/>
                    </div>
                </Fragment>
            );
        else
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Criteria {y + 1} ({x.points} points)</Typography>
                        <IconButton onClick={() => this.setState({currentlyEditing: 'criteria' + y})}>
                            <Edit/></IconButton>
                    </div>
                    {getMathJax('\\(' + x.LaTeX + '\\)')}
                    {getMathJax(formatString(x.explanation, x.strings))}
                </Fragment>
            );
    }

    renderHints() {
        if (this.state.currentlyEditing === null) return (
            <Typography>
                Hints will appear here when you start editing something. We are constantly
                working to improve them, so let us know if any part of the question builder
                is unclear and we'll do our best to make it right!
            </Typography>
        );
        if (this.state.currentlyEditing === 'mainPrompt') return (
            <Typography>
                Here is where you can enter the main prompt for your question. It will
                appear before all the answer fields, and be the most heavily emphasized.
                <ol>
                    <li>\(1+1\) is an inline equation.</li>
                    <li>\[1+1\] is a block equation.</li>
                    <li>`$1+1` evaluates $1+1, and then substitutes in.</li>
                </ol>
            </Typography>
        );
        if (this.state.currentlyEditing.startsWith('prompt')) return (
            <Typography>
                Here is where you can customize the answer fields for your question.
                Just choose an answer type, and then enter a prompt. For multiple choice
                questions, put the prompt on the first line, and each consecutive answer
                on its own line.
                <ol>
                    <li>\(1+1\) is an inline equation.</li>
                    <li>\[1+1\] is a block equation.</li>
                    <li>`$1+1` evaluates $1+1, and then substitutes in.</li>
                </ol>
            </Typography>
        );
        if (this.state.currentlyEditing === 'math') return (
            <Typography>
                Here, you can create all the variables you need to generate and mark your question.
                The way it works is that each line is its own formula, and the question will
                accumulate a list of variables that can be used anywhere.
                <ol>
                    <li>$1 is the result of the first expression.</li>
                    <li>@1 is the student's answer to the first part.</li>
                </ol>
                See the documentation tab in the sidebar for the list of available
                operators and functions.
            </Typography>
        );
        if (this.state.currentlyEditing.startsWith('criteria')) return (
            <Typography>
                Here, you can set the criteria the question will use to mark students' responses.
                The number of points a part is worth can be any number from 0.01 to 99.99, and
                the criteria expression works the same as any other math expression in the builder.
                If you need to mark a true or false question, look at the documentation on the
                tf and mc functions.
                <br/><br/>
                If you want, you can include an additional explanation for how to do the question.
                This follows the same formatting rules as the prompts.
            </Typography>
        );
    }

    updateSubPrompt(y, type, prompt) {
        let editorPrompts = copy(this.state.editorPrompts);
        prompt = prompt.replace(/\n\n/g, '—');
        editorPrompts[y] = {type, prompt};
        this.setState({editorPrompts});
    }

    updateCriteria(y, criteria, points, explanation) {
        if (!/^\d\d?(\.\d?\d?)?$/.test(points)) return;
        let editorCriteria = copy(this.state.editorCriteria);
        editorCriteria[y] = {criteria, points, explanation};
        this.setState({editorCriteria});
    }

    returnToManager() {
        let {selectedS, selectedQ, sets} = this.props.initWith;
        this.props.initManager([selectedS, selectedQ, sets]);
    }

    editorSave() {
        let id = this.state.sets[this.state.selectedS].questions[this.state.selectedQ].id;
        let answers = this.state.editorPrompts.length;
        let total = this.state.editorCriteria.map(x => Number(x.points)).reduce((x,y) => x+y, 0);
        let string = this.compile();
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
        Http.sampleQuestion(this.compile(), this.state.editorSeed, undefined,result => {
            this.setState({currentlyEditing: 'PREVIEW', preview: result});
        });
    }

    editorNewSeed() {
        let seed = Math.round(65536*Math.random());
        Http.sampleQuestion(this.compile(), seed, undefined,result => {
            this.setState({preview: result, editorSeed: seed});
        });
    }

    addPrompt() {
        let prompts = copy(this.state.editorPrompts);
        let editing = 'prompt' + prompts.length;
        prompts.push({prompt: '', type: '0'});
        this.setState({editorPrompts: prompts, currentlyEditing: editing});
    }

    addCriteria() {
        let criteria = copy(this.state.editorCriteria);
        let editing = 'criteria' + criteria.length;
        criteria.push({criteria: '', points: 1, explanation: ''});
        this.setState({editorCriteria: criteria, currentlyEditing: editing});
    }

    compile() {
        let qStringMath = [];
        let comments = [];
        if (this.state.editorMath.trim().length !== 0) {
            let editorMath = this.state.editorMath.split('\n');
            for (let i = 0; i < editorMath.length; i++) {
                let math = editorMath[i].split('#');
                qStringMath.push(buildMathCode(math[0])[0]);
                if (math[1] !== undefined)
                    comments.push(math[1].trim());
                else
                    comments.push('');
            }
        }
        let strings = [];
        let qStringPrompts = strNotation(this.state.editorPrompt, strings);
        for(let i=0; i<this.state.editorPrompts.length; i++)
            qStringPrompts += '，' + strNotation(this.state.editorPrompts[i].prompt, strings);
        let qStringCriteria = [];
        let qStringExplanations = [];
        for(let i=0; i<this.state.editorCriteria.length; i++) {
            let c = this.state.editorCriteria[i];
            qStringCriteria.push(buildMathCode(c.criteria)[0] + ' ' + c.points + ' %');
            qStringExplanations.push(strNotation(c.explanation, strings));
        }
        return qStringMath.concat(strings).concat(qStringCriteria).join('，')
            + '；' + qStringPrompts
            + '；' + this.state.editorPrompts.map(x => x.type).join('，')
            + '；' + qStringExplanations.join('，')
            + '；' + comments.join('，');
    }
}

QuestionBuilder.propTypes = {
    initManager: func.isRequired,
    initWith: object.isRequired,
};
