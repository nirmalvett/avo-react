import React, {Component, Fragment} from 'react';
import {List, Paper, Divider, ListItem, IconButton, ListItemText} from '@material-ui/core';
import {
    Add,
    Lock,
    Edit,
    Delete,
    Folder,
    Warning,
    TextFormat as Rename,
    NoteAdd as PasteIcon,
    FileCopy as CopyIcon,
    DeleteSweep as DeleteSet,
    InsertDriveFile as QuestionIcon,
    CreateNewFolder,
} from '@material-ui/icons';
import Http, {Set} from '../../HelperFunctions/Http';
import {uniqueKey} from '../../HelperFunctions/Helpers';
import {getMathJax} from '../../HelperFunctions/Utilities';
import AnswerInput from '../../AnswerInput/AnswerInput';
import {ShowSnackBar} from '../../Layout/Layout';

interface QuestionManagerProps {
    initWith: [number, number, Set[]];
    initBuilder: (state: QuestionManagerState) => void;
    showSnackBar: ShowSnackBar;
}

interface QuestionManagerState {
    selectedS: number | null;
    selectedQ: number | null;
    copiedQ: null | [number, number];
    sets: Set[];
    preview: {
        prompt: string;
        prompts: string[];
        types: number[];
        explanation: string[];
        variables: {[variable: string]: string};
    };
}

export default class QuestionManager extends Component<QuestionManagerProps, QuestionManagerState> {
    constructor(props: QuestionManagerProps) {
        super(props);
        this.state = {
            selectedS: this.props.initWith[0], // Selected Set
            selectedQ: null, // Selected Question
            copiedQ: null, // [Set, Question]
            sets: this.props.initWith[2],
            preview: {
                prompt: '',
                prompts: [],
                types: [],
                explanation: [],
                variables: {},
            },
        };
        if (this.props.initWith[2] !== []) this.getSets();
        if (this.props.initWith[1] !== null) this.selectQuestion(this.props.initWith[1]);
    }

    getSets = () => {
        Http.getSets(
            result => this.setState({sets: result.sets}),
            () => alert('Something went wrong when retrieving your question list'),
        );
    };

    render() {
        let {selectedS, selectedQ} = this.state;
        let canEdit = selectedS !== null && this.state.sets[selectedS].can_edit;
        return (
            <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                <div style={{flex: 3, display: 'flex'}}>
                    <Paper
                        square
                        style={{
                            width: '100%',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            paddingTop: '5px',
                            paddingBottom: '5px',
                        }}
                    >
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <IconButton onClick={() => this.newSet()}>
                                <CreateNewFolder />
                            </IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.renameSet()}>
                                <Rename />
                            </IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.deleteSet()}>
                                <DeleteSet />
                            </IconButton>
                        </div>
                        <List
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                marginTop: '5px',
                                marginBottom: '5px',
                            }}
                        >
                            {this.renderSetList()}
                        </List>
                    </Paper>
                </div>
                <div style={{flex: 3, display: 'flex', paddingBottom: 0, marginLeft: 8}}>
                    <Paper
                        square
                        style={{
                            width: '100%',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            paddingTop: '5px',
                            paddingBottom: '5px',
                        }}
                    >
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <IconButton disabled={!canEdit} onClick={() => this.newQuestion()}>
                                <Add />
                            </IconButton>
                            <IconButton
                                disabled={!canEdit || selectedQ === null}
                                onClick={() => this.renameQuestion()}
                            >
                                <Rename />
                            </IconButton>
                            <IconButton
                                disabled={!canEdit || selectedQ === null}
                                onClick={() => this.editQuestion()}
                            >
                                <Edit />
                            </IconButton>
                            <IconButton
                                disabled={selectedQ === null}
                                onClick={() => this.copyQuestion()}
                            >
                                <CopyIcon />
                            </IconButton>
                            <IconButton
                                disabled={!canEdit || selectedQ === null}
                                onClick={() => this.deleteQuestion()}
                            >
                                <Delete />
                            </IconButton>
                        </div>
                        <List
                            style={{
                                flex: 1,
                                overflowX: 'hidden',
                                overflowY: 'auto',
                                marginTop: '5px',
                                marginBottom: '5px',
                            }}
                        >
                            {this.renderQuestionList()}
                        </List>
                        {this.state.copiedQ !== null && canEdit ? (
                            <Fragment>
                                <Divider />
                                <ListItem
                                    key='paste'
                                    button
                                    onClick={this.pasteQuestion.bind(this)}
                                >
                                    <PasteIcon color='action' />
                                    <ListItemText
                                        inset
                                        secondary={
                                            this.state.sets[this.state.copiedQ[0]].questions[
                                                this.state.copiedQ[1]
                                            ].name
                                        }
                                    />
                                </ListItem>
                                <ListItem
                                    key='clearClipboard'
                                    button
                                    onClick={() => this.setState({copiedQ: null})}
                                >
                                    <Delete color='action' />
                                    <ListItemText inset secondary='Clear Clipboard' />
                                </ListItem>
                            </Fragment>
                        ) : null}
                        {selectedS !== null && !this.state.sets[selectedS].can_edit ? (
                            <Fragment>
                                <Divider />
                                <ListItem key='paste'>
                                    <Warning color='action' />
                                    <ListItemText inset secondary='This set is locked' />
                                </ListItem>
                            </Fragment>
                        ) : null}
                    </Paper>
                </div>
                <div style={{flex: 6, display: 'flex', paddingBottom: 0, marginLeft: 8}}>
                    <Paper
                        square
                        style={{
                            width: '100%',
                            flex: 1,
                            flexDirection: 'column',
                            paddingTop: '5px',
                            paddingBottom: '5px',
                            padding: '20px',
                            overflowY: 'auto',
                        }}
                    >
                        {this.renderQuestionPreview()}
                    </Paper>
                </div>
            </div>
        );
    }

    renderSetList() {
        let {selectedS} = this.state;
        return this.state.sets.map((set, index) => (
            <ListItem key={set.id + '-' + index} button onClick={() => this.selectSet(index)}>
                {set.can_edit ? (
                    <Folder color={selectedS === index ? 'primary' : 'action'} />
                ) : (
                    <Lock color={selectedS === index ? 'primary' : 'action'} />
                )}
                <ListItemText inset primary={set.name} />
            </ListItem>
        ));
    }

    renderQuestionList() {
        if (this.state.selectedS !== null)
            return this.state.sets[this.state.selectedS].questions.map((question, index) => (
                <ListItem
                    key={question.id + '-' + index}
                    button
                    onClick={() => this.selectQuestion(index)}
                >
                    <QuestionIcon color={this.state.selectedQ === index ? 'primary' : 'action'} />
                    <ListItemText inset secondary={question.name} />
                </ListItem>
            ));
    }

    renderQuestionPreview() {
        let {preview} = this.state;
        if (this.state.selectedQ !== null)
            return (
                <Fragment key='ManagerPreview'>
                    {getMathJax(preview.prompt)}
                    {preview.prompts.map((x, y) => (
                        <Fragment key={uniqueKey()}>
                            <Divider style={{marginTop: '10px', marginBottom: '10px'}} />
                            <AnswerInput disabled type={preview.types[y]} prompt={x} />
                        </Fragment>
                    ))}
                    {preview.explanation.map(x => (
                        <Fragment key={uniqueKey()}>
                            <Divider style={{marginTop: '10px', marginBottom: '10px'}} />
                            <div style={{position: 'relative'}}>{getMathJax(x)}</div>
                        </Fragment>
                    ))}
                </Fragment>
            );
    }

    selectSet(index: number) {
        this.setState({selectedS: index, selectedQ: null});
    }

    selectQuestion(index: number) {
        let {sets, selectedS} = this.state;
        Http.sampleQuestion(
            sets[selectedS as number].questions[index].string,
            0,
            undefined,
            result => this.setState({selectedQ: index, preview: result}),
            () => undefined,
        );
    }

    newSet() {
        let name = prompt('Set name:', '');
        if (name !== '' && name !== null)
            Http.newSet(name, () => this.getSets(), result => alert(result));
    }

    renameSet() {
        let set = this.state.sets[this.state.selectedS as number];
        let name = prompt('Set name:', set.name);
        if (name !== '' && name !== null)
            Http.renameSet(set.id, name, () => this.getSets(), result => alert(result));
    }

    deleteSet() {
        let set = this.state.sets[this.state.selectedS as number];
        let confirmation = confirm('Are you sure you want to delete this set?');
        if (confirmation)
            Http.deleteSet(
                set.id,
                async () => {
                    await this.setState({selectedS: null, selectedQ: null});
                    this.getSets();
                },
                result => alert(result),
            );
    }

    newQuestion() {
        Http.newQuestion(
            this.state.sets[this.state.selectedS as number].id,
            'New question',
            '-3 3 1 3 1 AC，2 3 0 ' +
                'AB，-2 2 1 3 1 AC；$1，$2，$3；$1 _A，$2 _A，$3 _A；Compute the vector sum \\({0}+{1}{2}\\).，；6；1；@0 $1 ' +
                '$2 $3 CD CB CN；The first step is to multiply the vector by the scalar, which you can do by multiplying ' +
                'each number in the vector. The second step is to add the result to the other vector, by adding each ' +
                'corresponding pair of numbers.；，，',
            1,
            1,
            () => this.getSets(),
            () => alert("The question couldn't be created."),
        );
    }

    renameQuestion() {
        let set = this.state.sets[this.state.selectedS as number];
        let question = set.questions[this.state.selectedQ as number];
        let name = prompt('Question name:', question.name);
        if (name !== '' && name !== null)
            Http.renameQuestion(question.id, name, () => this.getSets(), result => alert(result));
    }

    editQuestion() {
        this.props.initBuilder(this.state);
    }

    deleteQuestion() {
        let set = this.state.sets[this.state.selectedS as number];
        let question = set.questions[this.state.selectedQ as number];
        let confirmation = confirm('Are you sure you want to delete this question?');
        if (confirmation)
            Http.deleteQuestion(question.id, () => this.getSets(), result => alert(result));
    }

    copyQuestion() {
        this.setState({copiedQ: [this.state.selectedS as number, this.state.selectedQ as number]});
    }

    pasteQuestion() {
        const copied = this.state.copiedQ as [number, number];
        const question = this.state.sets[copied[0]].questions[copied[1]];
        Http.newQuestion(
            this.state.sets[this.state.selectedS as number].id,
            question.name,
            question.string,
            question.answers,
            question.total,
            this.getSets,
            () => this.props.showSnackBar('error', "The question couldn't be created.", 3000),
        );
    }
}
