import React, {Fragment} from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import Paper from "@material-ui/core/Paper/Paper";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Http from "./Http";
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
import IconButton from "@material-ui/core/IconButton/IconButton";
import TextField from "@material-ui/core/TextField/TextField";
import Select from "@material-ui/core/Select/Select";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import {buildPlainText} from "./QuestionBuilderUtils";
import {getMathJax} from "./Utilities";
import {uniqueKey} from "./helpers";
import Typography from "@material-ui/core/Typography/Typography";
import Divider from "@material-ui/core/Divider/Divider";
import AnswerInput from "./AVOAnswerInput/AnswerInput";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Button from "@material-ui/core/Button";

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
        let inputStyle = {
            flex: 1, width: '98%', margin: '1%', resize: 'none', background: 'transparent',
            color: theme.palette.type === 'dark' ? '#ffffff' : '#000000'
        };
        let cardStyle = {margin: 8, paddingLeft: 10, paddingRight: 10, paddingBottom: 10};
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
                    <Grid item xs={6} style={{flex: 1, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                        <Card style={cardStyle}>
                            {this.state.currentlyEditing === 'math'
                                ? <Fragment>
                                    <CardHeader title="Math" action={
                                        <IconButton onClick={() => this.setState({currentlyEditing: null})}>
                                            <Done/></IconButton>}/>
                                    <div>
                                        <TextField multiline value={this.state.editorMath} style={{width: '100%'}}
                                                   onChange={v => this.setState({editorMath: v.target.value})}/>
                                    </div>
                                </Fragment>
                                : <Fragment>
                                    <CardHeader title="Math" action={
                                        <IconButton onClick={() => this.setState({currentlyEditing: 'math'})}>
                                            <Edit/></IconButton>}/>
                                    {this.state.editorMath.split("\n").map(x => getMathJax(x))}
                                </Fragment>
                            }
                        </Card>
                        <Divider style={dividerStyle}/>
                        <Card style={cardStyle}>
                            <CardHeader title="Main Prompt" action={<IconButton><Edit/></IconButton>}/>
                            {getMathJax(this.state.editorPrompt)}
                        </Card>
                        <Divider style={dividerStyle}/>
                        {this.state.editorPrompts.map((x, y) => <Card style={cardStyle}>
                            <CardHeader title={"Prompt " + (y+1)} action={<IconButton><Edit/></IconButton>}/>
                            <AnswerInput key={x.prompt + x.type} disabled type={x.type} prompt={x.prompt}/>
                        </Card>)}
                        <div style={{margin: 8}}>
                            <Button variant='outlined' style={{width: '100%'}}>Add Prompt</Button>
                        </div>
                        <Divider style={dividerStyle}/>
                        {this.state.editorCriteria.map((x, y) => <Card style={cardStyle}>
                            <CardHeader title={"Criteria " + (y+1) + " (" + x.points + " points)"}
                                        action={<IconButton><Edit/></IconButton>}
                            />
                            {getMathJax(x.criteria)}
                            {getMathJax(x.explanation)}
                        </Card>)}
                        <div style={{margin: 8}}>
                            <Button variant='outlined' style={{width: '100%'}}>Add Criteria</Button>
                        </div>
                    </Grid>
                    <Grid item xs={6} style={{flex: 1, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                        <Card style={{flex: 1, margin: '10%', padding: 20}}>
                            <Typography>Some helpful hints could go here</Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Fragment>
        );
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
        let n = string.split('；')[2].split('，').map(x => ({type: x}));
        console.log(n);
        this.setState({mode: 1});
    }
}
