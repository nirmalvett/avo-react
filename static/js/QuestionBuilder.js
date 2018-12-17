import React, {Fragment} from 'react';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import Http from './Http';
import {uniqueKey} from './helpers';
import {copy, getMathJax, sleep} from './Utilities';
import {buildMathCode, buildPlainText, strNotation, varNotation} from './QuestionBuilderUtils';
import AnswerInput from './AVOAnswerInput/AnswerInput';
import {
    Folder,
    CreateNewFolder,
    TextFormat,
    DeleteSweep,
    Subject,
    Add,
    Edit,
    FileCopy,
    Delete,
    Warning,
    Save, ArrowBack, Refresh, Assignment, Done
} from '@material-ui/icons';

export default class QuestionBuilder extends React.Component {
    constructor(props) {
        super(props);
        this.getSets();
        this.state = {
            mode: 0, // 0 = list of sets/questions, 1 = editor
            selectedS: null, // Selected Set
            selectedQ: null, // Selected Question
            sets: [],
            preview: {},
            editorMath: 'var1 = equation1 # comment1\nvar2 = equation2 # comment2\nvar3 = equation3 # comment3',
            editorPrompt: 'Main prompt',
            editorPrompts: [{type: '0', prompt: 'Prompt 1'}, {type: '0', prompt: 'Prompt 2'}, {type: '0', prompt: 'Prompt 3'}],
            editorCriteria: [
                {criteria: 'criteria 1', points: 1, explanation: 'explanation 1'},
                {criteria: 'criteria 2', points: 2, explanation: 'explanation 2'},
                {criteria: 'criteria 3', points: 3, explanation: 'explanation 3'},
            ],
            currentlyEditing: null,
            editorSeed: Math.round(65536*Math.random()),
            initError: false,
            savedString: null,
        };
    }

    getSets() {
        Http.getSets(
            result => this.setState({sets: result.sets}),
            () => alert("Something went wrong when retrieving your question list")
        );
    }

    render() {
        if (this.state.mode === 0)
            return this.renderManager();
        else
            return this.renderBuilder();
    }

    renderManager() {
        let {selectedS, selectedQ} = this.state;
        let canEdit = selectedS !== null && this.state.sets[selectedS].can_edit;
        return (
            <Grid container spacing={8}>
                <Grid item xs={3} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{
                        width: '100%', flex: 1, display: 'flex', flexDirection: 'column',
                        paddingTop: '5px', paddingBottom: '5px'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <IconButton onClick={() => this.newSet()}><CreateNewFolder/></IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.renameSet()}><TextFormat/></IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.deleteSet()}><DeleteSweep/></IconButton>
                        </div>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                            {this.renderSetList()}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={3} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{
                        width: '100%', flex: 1, display: 'flex', flexDirection: 'column',
                        paddingTop: '5px', paddingBottom: '5px'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <IconButton disabled={!canEdit} onClick={() => this.newQuestion()}>
                                <Add/></IconButton>
                            <IconButton disabled={!canEdit || selectedQ === null} onClick={() => this.renameQuestion()}>
                                <TextFormat/></IconButton>
                            <IconButton disabled={!canEdit || selectedQ === null} onClick={() => this.editQuestion()}>
                                <Edit/></IconButton>
                            {/*<IconButton disabled={selectedQ === null} onClick={() => this.copyQuestion()}>*/}
                                {/*<FileCopy/></IconButton>*/}
                            <IconButton disabled={!canEdit || selectedQ === null} onClick={() => this.deleteQuestion()}>
                                <Delete/></IconButton>
                        </div>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                            {this.renderQuestionList()}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{
                        width: '100%', flex: 1, flexDirection: 'column', paddingTop: '5px',
                        paddingBottom: '5px', padding: '20px', overflowY: 'auto'
                    }}>
                        {this.renderQuestionPreview()}
                    </Paper>
                </Grid>
            </Grid>
        );
    }

    renderSetList() {
        let {selectedS} = this.state;
        return this.state.sets.map((set, index) =>
            <ListItem key = {set.id + '-' + index} button onClick={() => this.selectSet(index)}>
                <Folder color={selectedS === index ? 'primary' : 'action'}/>
                <ListItemText inset primary={set.name}/>
            </ListItem>
        );
    }

    renderQuestionList() {
        if (this.state.selectedS === null)
            return undefined;
        else
            return this.state.sets[this.state.selectedS].questions.map((question, index) =>
                <ListItem key = {question.id + '-' + index} button onClick={() => this.selectQuestion(index)}>
                    <Subject color={this.state.selectedQ === index ? 'primary' : 'action'}/>
                    <ListItemText inset secondary={question.name}/>
                </ListItem>
            );
    }

    renderQuestionPreview() {
        let {preview} = this.state;
        if (this.state.selectedQ === null)
            return undefined;
        else
            return (
                <Fragment>
                    {getMathJax(preview.prompt)}
                    {preview.prompts.map((x, y) => (
                        <Fragment>
                            <Divider key = { uniqueKey() } style={{marginTop: '10px', marginBottom: '10px'}}/>
                            <AnswerInput key = { uniqueKey() } disabled type={preview.types[y]} prompt={x}/>
                            </Fragment>
                    ))}
                    {preview.explanation.map((x) => (
                        <Fragment>
                            <Divider key={uniqueKey()} style={{marginTop: '10px', marginBottom: '10px'}}/>
                            <div key={uniqueKey()} style={{position: 'relative'}}>{getMathJax(x)}</div>
                            </Fragment>
                    ))}
                </Fragment>
            );
    }

    renderBuilder() {
        let {theme} = this.props;
        let cardStyle = {margin: 8, paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10};
        let dividerStyle = {marginTop: 15, marginBottom: 15};
        let disableSave = this.compile() === this.state.savedString;
        if (this.state.currentlyEditing === 'PREVIEW')
            return (
                <Fragment>
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 5}}>
                        <IconButton onClick={() => this.returnToManager()}>
                            <ArrowBack/></IconButton>
                        <IconButton onClick={() => this.editorSave()} disabled={disableSave}>
                            <Save/></IconButton>
                        <IconButton onClick={() => this.editorSaveAs()}>
                            <Add/></IconButton>
                        <IconButton onClick={() => this.setState({currentlyEditing: null})}>
                            <Edit color='primary'/></IconButton>
                        <IconButton onClick={() => this.editorNewSeed()}>
                            <Refresh/></IconButton>
                        {this.state.initError ? <IconButton disabled><Warning color='error'/></IconButton> : null}
                    </div>
                    <Grid container spacing={8} style={{flex: 1, margin: 0}}>
                        <Grid item xs={8} style={{flex: 1, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                            <Card style={cardStyle}>
                                <Typography variant='title' style={{marginTop: 10, marginBottom: 10}}>Math</Typography>
                                {this.renderMathCard()}
                                <Divider style={dividerStyle}/>
                                {this.state.preview.variables.map((x, y) =>
                                    getMathJax('\\($' + (y+1) + '=' + x + '\\)')
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
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 5}}>
                    <IconButton onClick={() => this.returnToManager()}><ArrowBack/></IconButton>
                    <IconButton onClick={() => this.editorSave()} disabled={disableSave}><Save/></IconButton>
                    <IconButton onClick={() => this.editorSaveAs()}><Add/></IconButton>
                    <IconButton onClick={() => this.editorPreview()}><Assignment/></IconButton>
                    {this.state.initError ? <IconButton disabled><Warning color='error'/></IconButton> : null}
                </div>
                <Grid container spacing={8} style={{flex: 1, margin: 0}}>
                    <Grid item xs={8} style={{flex: 1, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                        <Card style={cardStyle}>{this.renderMathCard()}</Card>
                        <Divider style={dividerStyle}/>

                        <Card style={cardStyle}>{this.renderMainPromptCard()}</Card>
                        <Divider style={dividerStyle}/>

                        {this.state.editorPrompts.map((x, y) =>
                            <Card style={cardStyle}>{this.renderSubPromptCard(x, y)}</Card>
                        )}
                        <div style={{margin: 8}}>
                            <Button variant='outlined' style={{width: '100%'}} onClick={() => {
                                let prompts = copy(this.state.editorPrompts);
                                let editing = 'prompt' + prompts.length;
                                prompts.push({prompt: '', type: '0'});
                                this.setState({editorPrompts: prompts, currentlyEditing: editing});
                            }}>Add Prompt</Button>
                        </div>
                        <Divider style={dividerStyle}/>

                        {this.state.editorCriteria.map((x, y) =>
                            <Card style={cardStyle}>{this.renderCriteriaCard(x, y)}</Card>
                        )}
                        <div style={{margin: 8}}>
                            <Button variant='outlined' style={{width: '100%'}} onClick={() => {
                                let criteria = copy(this.state.editorCriteria);
                                let editing = 'criteria' + criteria.length;
                                criteria.push({criteria: '', points: 1, explanation: ''});
                                this.setState({editorCriteria: criteria, currentlyEditing: editing});
                            }}>Add Criteria</Button>
                        </div>

                    </Grid>
                    <Grid item xs={4} style={{flex: 1, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                        <Card style={{flex: 1, margin: '8%', padding: 20}}>
                            {this.state.currentlyEditing === null
                                ? <Typography>
                                    Hints will appear here when you start editing something. We are constantly
                                    working to improve them, so let us know if any part of the question builder
                                    is unclear and we'll do our best to make it right!
                                </Typography>
                            : this.state.currentlyEditing === 'mainPrompt'
                                ? <Typography>
                                    Here is where you can enter the main prompt for your question. It will
                                    appear before all the answer fields, and be the most heavily emphasized.
                                    <ol>
                                        <li>\(1+1\) is an inline equation.</li>
                                        <li>\[1+1\] is a block equation.</li>
                                        <li>`$1+1` evaluates $1+1, and then substitutes in.</li>
                                    </ol>
                                </Typography>
                            : this.state.currentlyEditing.startsWith('prompt')
                                ? <Typography>
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
                            : this.state.currentlyEditing === 'math'
                                ? <Typography>
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
                            : this.state.currentlyEditing.startsWith('criteria')
                                ? <Typography>
                                    Here, you can set the criteria the question will use to mark students' responses.
                                    The number of points a part is worth can be any number from 0.01 to 99.99, and
                                    the criteria expression works the same as any other math expression in the builder.
                                    If you need to mark a true or false question, look at the documentation on the
                                    tf and mc functions.
                                    <br/><br/>
                                    If you want, you can include an additional explanation for how to do the question.
                                    This follows the same formatting rules as the prompts.
                                </Typography>
                            : null
                            }
                        </Card>
                    </Grid>
                </Grid>
            </Fragment>
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
                if (result === null)
                    return <Typography color='error'>{x}</Typography>;
                if (result[2] === undefined)
                    return getMathJax('\\(\\small ' + buildMathCode(result[1])[2] + "\\)");
                return getMathJax('\\(\\small ' + buildMathCode(result[1])[2]
                    + "\\color{grey}{\\text{ # " + result[2] + "}}\\)");
            });
            return steps;
        } else {
            let steps = this.state.editorMath.split('\n');
            // steps = steps.map(x => {
            //     let result = /([A-Z]\w*) ?=([^#]+)(?:#(.*))?/.exec(x);
            //     if (result === null)
            //         return <Typography color='error'>{x}</Typography>;
            //     if (result[3] === undefined)
            //         return getMathJax('\\(\\small\\text{' + result[1] + '}=' + buildMathCode(result[2])[2] + "\\)");
            //     return getMathJax('\\(\\small\\text{' + result[1] + '}=' + buildMathCode(result[2])[2]
            //         + "\\color{grey}{\\text{ # " + result[3] + "}}\\)");
            // });
            steps = steps.map(x => {
                let result = /([^#]+)(?:#(.*))?/.exec(x);
                if (result === null)
                    return <Typography color='error'>{x}</Typography>;
                if (result[2] === undefined)
                    return getMathJax('\\(\\small ' + buildMathCode(result[1])[2] + "\\)");
                return getMathJax('\\(\\small ' + buildMathCode(result[1])[2]
                    + "\\color{grey}{\\text{ # " + result[2] + "}}\\)");
            });
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Math</Typography>
                        <IconButton onClick={() => this.setState({currentlyEditing: 'math'})}>
                            <Edit/></IconButton>
                    </div>
                    {steps}
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
            while (/`.*?`/.test(editorPrompt)) {
                let match = /`(.*?)`/.exec(editorPrompt);
                editorPrompt = editorPrompt.slice(0, match.index)
                    + '\\color{#5599ff}{'
                    + buildMathCode(match[1])[2].replace(/\\color{.*?}/g, '')
                    + '}'
                    + editorPrompt.slice(match.index + match[0].length);
            }
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Main Prompt</Typography>
                        <IconButton onClick={() => this.setState({currentlyEditing: 'mainPrompt'})}>
                            <Edit/></IconButton>
                    </div>
                    {getMathJax(editorPrompt)}
                </Fragment>
            );
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
            let {prompt} = x;
            while (/`.*?`/.test(prompt)) {
                let match = /`(.*?)`/.exec(prompt);
                prompt = prompt.slice(0, match.index)
                    + buildMathCode(match[1])[2]
                    + prompt.slice(match.index + match[0].length);
            }
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

    updateSubPrompt(y, type, prompt) {
        let editorPrompts = copy(this.state.editorPrompts);
        prompt = prompt.replace(/\n\n/g, '—');
        editorPrompts[y] = {type, prompt};
        this.setState({editorPrompts});
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
                    {getMathJax('\\(' + buildMathCode(x.criteria)[2] + '\\)')}
                    {getMathJax(x.explanation)}
                </Fragment>
            );
    }

    updateCriteria(y, criteria, points, explanation) {
        if (!/^\d\d?(\.\d?\d?)?$/.test(points)) return;
        let editorCriteria = copy(this.state.editorCriteria);
        editorCriteria[y] = {criteria, points, explanation};
        this.setState({editorCriteria});
    }

    selectSet(index) {
        this.setState({selectedS: index, selectedQ: null})
    }

    selectQuestion(index) {
        let {sets, selectedS} = this.state;
        Http.sampleQuestion(sets[selectedS].questions[index].string, 0, undefined,result => {
            this.setState({selectedQ: index, preview: result});
            }, result => {}
        );
    }

    newSet() {
        let name = prompt('Set name:', '');
        if (name !== '' && name !== null)
            Http.newSet(name, () => this.getSets(), result => alert(result));
    }

    renameSet() {
        let set = this.state.sets[this.state.selectedS];
        let name = prompt('Set name:', set.name);
        if (name !== '' && name !== null)
            Http.renameSet(set.id, name, () => this.getSets(), result => alert(result));
    }

    deleteSet() {
        let set = this.state.sets[this.state.selectedS];
        let confirmation = confirm('Are you sure you want to delete this set?');
        if (confirmation)
            Http.deleteSet(set.id, () => this.getSets(), result => alert(result));
    }

    // noinspection JSMethodCanBeStatic
    newQuestion() {
        alert("New question");
    }

    renameQuestion() {
        let set = this.state.sets[this.state.selectedS];
        let question = set.questions[this.state.selectedQ];
        let name = prompt('Question name:', question.name);
        if (name !== '' && name !== null)
            Http.renameQuestion(question.id, name, () => this.getSets(), result => alert(result));
    }

    editQuestion() {
        // noinspection JSIgnoredPromiseFromCall
        this.initBuilder(this.state.sets[this.state.selectedS].questions[this.state.selectedQ].string);
    }

    // noinspection JSMethodCanBeStatic
    // copyQuestion() {
    //     alert("Copy question");
    // }

    deleteQuestion() {
        let set = this.state.sets[this.state.selectedS];
        let question = set.questions[this.state.selectedQ];
        let confirmation = confirm('Are you sure you want to delete this question?');
        if (confirmation)
            Http.deleteQuestion(question.id, () => this.getSets(), result => alert(result));
    }

    async initBuilder(string) {
        string = string.toString(); // Yes this does nothing, but now my IDE knows that string is a string
        let sections = string.split('；').map(x => x.split('，'));
        let math = sections[0];
        let types = sections[2];
        let comments = sections[4].map(x => x.length === 0 ? x : (' # ' + x));

        let editorMath = [];
        while (math.length !== 0 && !math[0].includes('_') && !math[0].endsWith('%'))
            editorMath.push(buildPlainText(math.splice(0, 1)[0])[0] + comments.splice(0, 1)[0]);

        let stringEquations = [];
        while (math.length !== 0 && !math[0].includes('%'))
            stringEquations.push(buildPlainText(math.splice(0,1)[0])[0]);

        let prompts = sections[1].map(x => varNotation(x, stringEquations));
        let explanations = sections[3].map(x => varNotation(x, stringEquations));

        let editorCriteria = [];
        while (math.length !== 0) {
            let match = /^(.*?) (\d+(?:\.\d+)?) %$/.exec(math.splice(0, 1)[0]);
            editorCriteria.push({
                points: match[2],
                criteria: buildPlainText(match[1])[0],
                explanation: explanations.splice(0, 1)[0]
            });
        }

        this.setState({
            mode: 1,
            editorMath: editorMath.join('\n'),
            editorPrompt: prompts[0],
            editorPrompts: prompts.slice(1).map((x,y) => {return {prompt: x, type: types[y]};}),
            editorCriteria: editorCriteria,
            currentlyEditing: null,
            initError: false,
            savedString: string,
        });

        await sleep(100);
        let initString = string.substr(0, string.lastIndexOf('；'));
        let compileString = this.compile();
        compileString = compileString.substr(0, compileString.lastIndexOf('；'));
        if (initString !== compileString) {
            this.setState({initError: true});
            console.log("Warning: This question could not be recompiled to its initial state." +
                " Check the diff below before saving.");
            console.log("Server: " + initString);
            console.log("Local:  " + compileString);
        }
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

    returnToManager() {
        this.setState({mode: 0});
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

    editorSaveAs() {
        let name = prompt('What do you want to call your new question?');
        if (name !== "" && name !== null) {
            let id = this.state.sets[this.state.selectedS].questions[this.state.selectedQ].id;
            let answers = this.state.editorPrompts.length;
            let total = this.state.editorCriteria.map(x => Number(x.points)).reduce((x,y) => x+y, 0);
            let string = this.compile();
            Http.newQuestion(set, name, string, answers, total,
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
}
