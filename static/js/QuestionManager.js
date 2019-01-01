import React, {Component, Fragment} from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import ListItemText from '@material-ui/core/ListItemText';
import Http from './Http';
import {uniqueKey} from './helpers';
import {getMathJax} from './Utilities';
import AnswerInput from './AVOAnswerInput/AnswerInput';
import Add from '@material-ui/icons/Add';
import Lock from '@material-ui/icons/Lock';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import Folder from '@material-ui/icons/Folder';
import Warning from '@material-ui/icons/Warning';
import Rename from '@material-ui/icons/TextFormat';
import PasteIcon from '@material-ui/icons/NoteAdd';
import CopyIcon from '@material-ui/icons/FileCopy';
import DeleteSet from '@material-ui/icons/DeleteSweep';
import QuestionIcon from '@material-ui/icons/InsertDriveFile';
import CreateNewFolder from '@material-ui/icons/CreateNewFolder';
import {func, array} from "prop-types";

export default class QuestionManager extends Component {
    can_edit;
    constructor(props) {
        super(props);
        this.state = {
            selectedS: this.props.initWith[0], // Selected Set
            selectedQ: null, // Selected Question
            copiedQ: null, // [Set, Question]
            sets: this.props.initWith[2],
            preview: {},
        };
        if (this.props.initWith[2] !== []) this.getSets();
        if (this.props.initWith[1] !== null) this.selectQuestion(this.props.initWith[1]);
    }

    getSets() {
        Http.getSets(
            result => this.setState({sets: result.sets}),
            () => alert("Something went wrong when retrieving your question list")
        );
    }

    render() {
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
                            <IconButton disabled={!canEdit} onClick={() => this.renameSet()}><Rename/></IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.deleteSet()}><DeleteSet/></IconButton>
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
                                <Rename/></IconButton>
                            <IconButton disabled={!canEdit || selectedQ === null} onClick={() => this.editQuestion()}>
                                <Edit/></IconButton>
                            <IconButton disabled={selectedQ === null} onClick={() => this.copyQuestion()}>
                                <CopyIcon/></IconButton>
                            <IconButton disabled={!canEdit || selectedQ === null} onClick={() => this.deleteQuestion()}>
                                <Delete/></IconButton>
                        </div>
                        <List style={{flex: 1, overflowX: 'hidden', overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                            {this.renderQuestionList()}
                        </List>
                        {this.state.copiedQ !== null && canEdit
                            ? <Fragment>
                                <Divider/>
                                <ListItem key='paste' button onClick={this.pasteQuestion.bind(this)}>
                                    <PasteIcon color='action'/>
                                    <ListItemText inset secondary={this.state.sets[this.state.copiedQ[0]].questions[this.state.copiedQ[1]].name}/>
                                </ListItem>
                                <ListItem key='clearClipboard' button onClick={() => this.setState({copiedQ: null})}>
                                    <Delete color='action'/><ListItemText inset secondary='Clear Clipboard'/>
                                </ListItem>
                            </Fragment>
                            : null
                        }
                        {selectedS !== null && !this.state.sets[selectedS].can_edit
                            ? <Fragment>
                                <Divider/>
                                <ListItem key='paste'>
                                    <Warning color='action'/>
                                    <ListItemText inset secondary='This set is locked'/>
                                </ListItem>
                            </Fragment>
                            : null
                        }
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
                {set.can_edit
                    ? <Folder color={selectedS === index ? 'primary' : 'action'}/>
                    : <Lock color={selectedS === index ? 'primary' : 'action'}/>
                }
                <ListItemText inset primary={set.name}/>
            </ListItem>
        );
    }

    renderQuestionList() {
        if (this.state.selectedS === null)
            return undefined;
        else
            return (
                this.state.sets[this.state.selectedS].questions.map((question, index) =>
                    <ListItem key = {question.id + '-' + index} button onClick={() => this.selectQuestion(index)}>
                        <QuestionIcon color={this.state.selectedQ === index ? 'primary' : 'action'}/>
                        <ListItemText inset secondary={question.name}/>
                    </ListItem>
                )
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
            Http.deleteSet(set.id, async () => {
                await this.setState({selectedS: null, selectedQ: null});
                this.getSets();
            }, result => alert(result));
    }

    newQuestion() {
        Http.newQuestion(this.state.sets[this.state.selectedS].id, 'New question', '-4 4 0 3 1 AC，2 3 0 ' +
            'AB，-4 4 0 3 1 AC，$0 _A，$1 _A，$2 _A，@0 $0 $1 $2 CD CB CN 1 %；Compute the vector sum \\({0}+{1}{2}\\).' +
            '，；6；；，，', 1, 1,
            () => this.getSets(),
            () => alert("The question couldn't be created.")
        );
    }

    renameQuestion() {
        let set = this.state.sets[this.state.selectedS];
        let question = set.questions[this.state.selectedQ];
        let name = prompt('Question name:', question.name);
        if (name !== '' && name !== null)
            Http.renameQuestion(question.id, name, () => this.getSets(), result => alert(result));
    }

    editQuestion() {
        this.props.initBuilder(this.state);
    }

    deleteQuestion() {
        let set = this.state.sets[this.state.selectedS];
        let question = set.questions[this.state.selectedQ];
        let confirmation = confirm('Are you sure you want to delete this question?');
        if (confirmation)
            Http.deleteQuestion(question.id, () => this.getSets(), result => alert(result));
    }

    copyQuestion() {
        this.setState({copiedQ: [this.state.selectedS, this.state.selectedQ]});
    }

    pasteQuestion() {
        const question = this.state.sets[this.state.copiedQ[0]].questions[this.state.copiedQ[1]];
        Http.newQuestion(this.state.sets[this.state.selectedS].id, question.name, question.string,
            question.answers, question.total,
            () => this.getSets(),
            () => this.props.showSnackBar("error", "The question couldn't be created.")
        );
    }
}

QuestionManager.propTypes = {
    initBuilder: func.isRequired,
    initWith: array.isRequired,
};
