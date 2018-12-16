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
import {copy, getMathJax} from './Utilities';
import {buildMathCode, buildPlainText, varNotation} from './QuestionBuilderUtils';
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
                            <IconButton disabled={selectedQ === null} onClick={() => this.copyQuestion()}>
                                <FileCopy/></IconButton>
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
        return (
            <Fragment>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: 5}}>
                    <IconButton><ArrowBack/></IconButton>
                    <IconButton><Save/></IconButton>
                    <IconButton><Add/></IconButton>
                    <IconButton><Assignment/></IconButton>
                    <IconButton><Refresh/></IconButton>
                </div>
                <Grid container spacing={8} style={{flex: 1, margin: 0}}>
                    <Grid item xs={7} style={{flex: 1, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                        <Card style={cardStyle}>{this.renderMathCard()}</Card>
                        <Divider style={dividerStyle}/>

                        <Card style={cardStyle}>{this.renderMainPromptCard()}</Card>
                        <Divider style={dividerStyle}/>

                        {this.state.editorPrompts.map((x, y) =>
                            <Card style={cardStyle}>{this.renderSubPromptCard(x, y)}</Card>
                        )}
                        <div style={{margin: 8}}>
                            <Button variant='outlined' style={{width: '100%'}}>Add Prompt</Button>
                        </div>
                        <Divider style={dividerStyle}/>

                        {this.state.editorCriteria.map((x, y) =>
                            <Card style={cardStyle}>{this.renderCriteriaCard(x, y)}</Card>
                        )}
                        <div style={{margin: 8}}>
                            <Button variant='outlined' style={{width: '100%'}}>Add Criteria</Button>
                        </div>

                    </Grid>
                    <Grid item xs={5} style={{flex: 1, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                        <Card style={{flex: 1, margin: '10%', padding: 20}}>
                            <Typography>Some helpful hints could go here</Typography>
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
        else {
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
                    + buildMathCode(match[1])[2]
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
        if (this.state.currentlyEditing === 'prompt' + y)
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Prompt {y+1}</Typography>
                        <IconButton onClick={() => this.setState({currentlyEditing: null})}>
                            <Done/></IconButton>
                    </div>
                    <div><Select value={x.type} style={{width: '100%'}}
                                 onChange={v => this.updateSubPrompt(y, v.target.value, x.prompt)}>
                        <MenuItem value='0'>True/false</MenuItem>
                        <MenuItem value='1'>Multiple choice</MenuItem>
                        <MenuItem value='2'>Number</MenuItem>
                        <MenuItem value='5' disabled>Polynomial</MenuItem>
                        <MenuItem value='6'>Vector</MenuItem>
                        <MenuItem value='7'>Vector with free variables</MenuItem>
                        <MenuItem value='8'>Matrix</MenuItem>
                        <MenuItem value='9'>Basis</MenuItem>
                    </Select></div>
                    <div><TextField multiline value={x.prompt} style={{width: '100%'}}
                                    onChange={v => this.updateSubPrompt(y, x.type, v.target.value)}/></div>
                </Fragment>
            );
        else {
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
        editorPrompts[y] = {type, prompt};
        this.setState({editorPrompts});
    }

    renderCriteriaCard(x, y) {
        if (this.state.currentlyEditing === 'criteria' + y)
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant='title'>Criteria {y+1}</Typography>
                        <IconButton onClick={() => this.setState({currentlyEditing: null})}>
                            <Done/></IconButton>
                    </div>
                    <div>
                        <TextField value={x.criteria} style={{width: '100%'}} label='Expression'
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
        let editorCriteria = copy(this.state.editorCriteria);
        editorCriteria[y] = {criteria, points, explanation};
        this.setState({editorCriteria});
    }

    selectSet(index) {
        this.setState({selectedS: index, selectedQ: null})
    }

    selectQuestion(index) {
        let {sets, selectedS} = this.state;
        Http.sampleQuestion(sets[selectedS].questions[index].string, undefined,result => {
            this.setState({selectedQ: index, preview: result});
            console.log(result);
            }, result => {
            console.log(result);
            }
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
        let set = this.state.sets[this.state.selectedS];
        let question = set.questions[this.state.selectedQ];
        this.initBuilder(question.string);
    }

    // noinspection JSMethodCanBeStatic
    copyQuestion() {
        alert("Copy question");
    }

    deleteQuestion() {
        let set = this.state.sets[this.state.selectedS];
        let question = set.questions[this.state.selectedQ];
        let confirmation = confirm('Are you sure you want to delete this question?');
        if (confirmation)
            Http.deleteQuestion(question.id, () => this.getSets(), result => alert(result));
    }

    initBuilder(string) {
        let sections = string.split('；').map(x => x.split('，'));
        let math = sections[0];
        let types = sections[2];
        let explanations = sections[3];
        let comments = sections[4].map(x => x.length === 0 ? x : (' # ' + x));

        let editorMath = [];
        while (math.length !== 0 && !math[0].includes('_') && !math[0].endsWith('%'))
            editorMath.push(buildPlainText(math.splice(0, 1)[0])[0] + comments.splice(0, 1)[0]);

        let stringEquations = [];
        while (math.length !== 0 && !math[0].includes('%'))
            stringEquations.push(buildPlainText(math.splice(0,1)[0])[0] + comments.splice(0, 1)[0]);

        let editorCriteria = [];
        while (math.length !== 0) {
            let match = /^(.*?) (\d+(?:\.\d+)?) %$/.exec(math.splice(0, 1)[0]);
            editorCriteria.push({
                points: match[2],
                criteria: buildPlainText(match[1])[0] + comments.splice(0, 1)[0],
                explanation: explanations.splice(0, 1)[0]
            });
        }

        let prompts = sections[1].map(x => varNotation(x, stringEquations));

        this.setState({
            mode: 1,
            editorMath: editorMath.join('\n'),
            editorPrompt: prompts[0],
            editorPrompts: prompts.slice(1).map((x,y) => {return {prompt: x, type: types[y]};}),
            editorCriteria: editorCriteria,
            currentlyEditing: null
        });
		// if (this.questionString !== string) {
		// 	alert("An unexpected error occurred while formatting the question to be editable. The editor fields have " +
        //         "been filled as best as possible, but some modifications had to be made and the functionality of the " +
        //         "question may be affected.");
		// 	console.log("Server: " + string);
		// 	console.log("Local:  " + this.questionString);
		// }
    }

    compile() {
        return this.state.editorPrompt;
    }
}
