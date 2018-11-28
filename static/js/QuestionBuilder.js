import React, {Fragment} from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import Paper from "@material-ui/core/Paper/Paper";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Http from "./Http";
import {Folder, CreateNewFolder, TextFormat, DeleteSweep, Subject, Add, Edit, FileCopy, Delete} from '@material-ui/icons';
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

export default class QuestionBuilder extends React.Component {
    constructor(props) {
        super(props);
        this.getSets();
        this.state = {
            mode: 0, // 0 = list of sets/questions, 1 = editor
            selectedS: null, // Selected Set
            selectedQ: null, // Selected Question
            sets: [],
            questionSteps: [],
            questionPrompt: '',
            questionFields: [],
            preview: {},
        };
    }

    getSets() {
        Http.getSets(
            result => this.setState({sets: result.sets}),
            () => alert("Something went wrong when retrieving your question list")
        );
    }

    render() {
        let {theme} = this.props;
        let {selectedS, selectedQ, preview} = this.state;
        let canEdit = selectedS !== null && this.state.sets[selectedS].can_edit;
        if (this.state.mode === 0) return (
            <Grid container spacing={8}>
                <Grid item xs={3} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex', flexDirection: 'column',
                        paddingTop: '5px', paddingBottom: '5px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <IconButton onClick={() => this.newSet()}><CreateNewFolder/></IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.renameSet()}><TextFormat/></IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.deleteSet()}><DeleteSweep/></IconButton>
                        </div>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                            {this.state.sets.map((set, index) =>
                                <ListItem key = {set.id + '-' + index} button
                                          onClick={() => this.selectSet(index)}>
                                    <Folder color={selectedS === index ? 'primary' : 'action'}/>
                                    <ListItemText inset primary={set.name}/>
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={3} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex', flexDirection: 'column',
                        paddingTop: '5px', paddingBottom: '5px'}}>
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
                            {this.state.selectedS === null
                                ? undefined
                                : this.state.sets[this.state.selectedS].questions.map((question, index) =>
                                    <ListItem key = {question.id + '-' + index} button
                                              onClick={() => this.selectQuestion(index)}>
                                        <Subject color={this.state.selectedQ === index ? 'primary' : 'action'}/>
                                        <ListItemText inset secondary={question.name}/>
                                    </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex', flexDirection: 'column',
                        paddingTop: '5px', paddingBottom: '5px', padding: '20px', overflowY: 'auto'}}>
                        {selectedQ !== null ? <Fragment>
                            {getMathJax(preview.prompt)}
                            {preview.prompts.map((x, y) => <Fragment>
                                <Divider key = { uniqueKey() } style={{marginTop: '10px', marginBottom: '10px'}}/>
                                <AnswerInput key = { uniqueKey() } disabled type={preview.types[y]} prompt={x}/>
                            </Fragment>)}
                            {preview.explanation.map((x) => <Fragment>
                                <Divider key={uniqueKey()} style={{marginTop: '10px', marginBottom: '10px'}}/>
                                <div key={uniqueKey()} style={{position: 'relative'}}>{getMathJax(x)}</div>
                            </Fragment>)}
                            </Fragment> : undefined}
                    </Paper>
                </Grid>
            </Grid>
        );
        else return (
            <Grid container spacing={8}>
                <Grid item xs={6} style={{flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 0}}>
                    <textarea style={{
                        flex: 1, width: '98%', margin: '1%', resize: 'none', background: 'transparent',
                        color: theme.palette.type === 'dark' ? '#ffffff' : '#000000'
                    }}>
                        {this.state.qString.split('；')[0].split('，').map(
                            x => buildPlainText(x)
                        ).join('\n')}
                    </textarea>
                    <textarea style={{
                        flex: 1, width: '98%', margin: '1%', resize: 'none', background: 'transparent',
                        color: theme.palette.type === 'dark' ? '#ffffff' : '#000000'
                    }}>
                        {this.state.qString.split('；')[1].split('，')[0]}
                    </textarea>
                    <div style={{flex: 1, width: '100%'}}>{this.state.questionFields.map(field => (
                        <div>
                            <Select value={field.type} onChange={this.handleChange}
                                    inputProps={{name: 'age', id: 'age-simple'}}>
                                <MenuItem value="">-</MenuItem>
                                <MenuItem value='0'>True/false</MenuItem>
                                <MenuItem value='1'>Multiple choice</MenuItem>
                                <MenuItem value='2'>Number</MenuItem>
                                <MenuItem value='3'>List of numbers</MenuItem>
                                <MenuItem value='4'>Vector</MenuItem>
                                <MenuItem value='5'>Matrix</MenuItem>
                                <MenuItem value='6'>Basis</MenuItem>
                                <MenuItem value='7'>Vector (free vars)</MenuItem>
                                <MenuItem value='8'>Linear equation</MenuItem>
                                <MenuItem value='9'>Polynomial</MenuItem>
                            </Select>
                            <TextField/>
                            <TextField/>
                        </div>
                    ))}</div>
                </Grid>
            </Grid>
        );
    }

    selectSet(index) {
        this.setState({selectedS: index, selectedQ: null})
    }

    selectQuestion(index) {
        let {sets, selectedS, selectedQ} = this.state;
        Http.sampleQuestion(sets[selectedS].questions[index].string, undefined,result => {
            this.setState({selectedQ: index, preview: result});
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
        this.setState({mode: 1, qString: string, questionFields: n});
    }
}