import React, {Component, Fragment} from 'react';
import {
    List,
    Paper,
    Divider,
    ListItem,
    IconButton,
    ListItemText,
    ListItemIcon,
    Button,
    Dialog,
    TextField,
    DialogTitle, MenuItem, Select,
} from '@material-ui/core';
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
    ArrowBack,
} from '@material-ui/icons';
import * as Http from '../Http';
import {uniqueKey} from '../HelperFunctions/Helpers';
import {AnswerInput} from '../AnswerInput';
import {ShowSnackBar} from '../Layout/Layout';
import {QuestionSet, Course} from '../Http/types';
import {QuestionBuilderSelection} from './QuestionBuilderHome';
import {Content} from '../HelperFunctions/Content';

export interface QuestionManagerProps {
    selection: QuestionBuilderSelection;
    deselect: () => void;
    selectSet: (set: number) => () => void;
    selectQuestion: (set: number, question: number) => () => void;
    sets: QuestionSet[];
    courses: Course[];
    initBuilder: () => void;
    showSnackBar: ShowSnackBar;
    returnHome: () => void;
    updateSets: (sets: QuestionSet[]) => void;
}

export interface QuestionManagerState {
    copiedQ: null | { q: number; s: number };
    preview: {
        prompt: string;
        prompts: string[];
        types: string[];
        explanation: string[];
        variables: { [variable: string]: string };
    };
    addDiagOpen: boolean;
    course: number;
    setName: string;
}

export default class QuestionManager extends Component<QuestionManagerProps, QuestionManagerState> {
    constructor(props: QuestionManagerProps) {
        super(props);
        this.state = {
            copiedQ: null, // [Set, Question]
            preview: {
                prompt: '',
                prompts: [],
                types: [],
                explanation: [],
                variables: {},
            },
            addDiagOpen: false,
            course: 0,
            setName: '',
        };
        if (this.props.sets.length === 0) {
            this.getSets();
        }
        if (this.props.selection.mode === 'question') {
            this.selectQuestion(this.props.selection.q);
        }
    }

    getSets = () => {
        Http.getSets(
            result => this.props.updateSets(result.sets),
            () => alert('Something went wrong when retrieving your question list'),
        );
    };

    render() {
        let canEdit =
            this.props.selection.mode !== null && this.props.sets[this.props.selection.s].canEdit;
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
                            <IconButton
                                aria-label='go back'
                                onClick={() => this.props.returnHome()}
                            >
                                <ArrowBack/>
                            </IconButton>
                            <IconButton onClick={() => this.setState({addDiagOpen: true})}>
                                <CreateNewFolder/>
                            </IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.renameSet()}>
                                <Rename/>
                            </IconButton>
                            <IconButton disabled={!canEdit} onClick={() => this.deleteSet()}>
                                <DeleteSet/>
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
                                <Add/>
                            </IconButton>
                            <IconButton
                                disabled={!canEdit || this.props.selection.mode !== 'question'}
                                onClick={() => this.renameQuestion()}
                            >
                                <Rename/>
                            </IconButton>
                            <IconButton
                                disabled={!canEdit || this.props.selection.mode !== 'question'}
                                onClick={this.props.initBuilder}
                            >
                                <Edit/>
                            </IconButton>
                            <IconButton
                                disabled={this.props.selection.mode !== 'question'}
                                onClick={() => this.copyQuestion()}
                            >
                                <CopyIcon/>
                            </IconButton>
                            <IconButton
                                disabled={!canEdit || this.props.selection.mode !== 'question'}
                                onClick={() => this.deleteQuestion()}
                            >
                                <Delete/>
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
                                <Divider/>
                                <ListItem
                                    key='paste'
                                    button
                                    onClick={this.pasteQuestion.bind(this)}
                                >
                                    <ListItemIcon>
                                        <PasteIcon color='action'/>
                                    </ListItemIcon>
                                    <ListItemText
                                        secondary={
                                            this.props.sets[this.state.copiedQ.s].questions[
                                                this.state.copiedQ.q
                                                ].name
                                        }
                                    />
                                </ListItem>
                                <ListItem
                                    key='clearClipboard'
                                    button
                                    onClick={() => this.setState({copiedQ: null})}
                                >
                                    <ListItemIcon>
                                        <Delete color='action'/>
                                    </ListItemIcon>
                                    <ListItemText secondary='Clear Clipboard'/>
                                </ListItem>
                            </Fragment>
                        ) : null}
                        {this.props.selection.mode !== null &&
                        !this.props.sets[this.props.selection.s].canEdit ? (
                            <Fragment>
                                <Divider/>
                                <ListItem key='paste'>
                                    <ListItemIcon>
                                        <Warning color='action'/>
                                    </ListItemIcon>
                                    <ListItemText secondary='This set is locked'/>
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
                <Dialog
                    onClose={() => this.setState({addDiagOpen: false})}
                    aria-labelledby='select-course-dialog'
                    open={this.state.addDiagOpen}
                >
                    <DialogTitle id='select-course-dialog'>
                        Select the course for the set
                    </DialogTitle>

                    <List>
                        <Select
                            value={this.state.course}
                            onChange={(event: any) => this.setState({course: event.target.value})}
                            style={{marginLeft: 16, width: 165}}
                        >
                            <MenuItem value={-1}>--Select a course--</MenuItem>
                            {this.props.courses.map(course => {
                                if (course.canEdit) {
                                    return <MenuItem value={course.courseID}>{course.name}</MenuItem>;
                                }
                            })}
                        </Select>
                        <ListItem>
                            <form noValidate autoComplete='off'>
                                <TextField
                                    required
                                    id='set-name'
                                    label='Set Name'
                                    margin='normal'
                                    onChange={(event: any) =>
                                        this.setState({setName: event.target.value})
                                    }
                                />
                            </form>
                        </ListItem>
                        <ListItem>
                            <Button color='primary' onClick={() => this.newSet()}>
                                Add Set
                            </Button>
                            <Button
                                color='primary'
                                onClick={() => this.setState({addDiagOpen: false})}
                            >
                                Cancel
                            </Button>
                        </ListItem>
                    </List>
                </Dialog>
            </div>
        );
    }

    renderSetList() {
        let s =
            this.props.selection.mode === null ? -1 : this.props.sets[this.props.selection.s].setID;
        return this.props.sets.map((set, index) => (
            <ListItem key={set.setID + '-' + index} button onClick={this.props.selectSet(index)}>
                <ListItemIcon>
                    {set.canEdit ? (
                        <Folder color={s === set.setID ? 'primary' : 'action'}/>
                    ) : (
                        <Lock color={s === set.setID ? 'primary' : 'action'}/>
                    )}
                </ListItemIcon>
                <ListItemText primary={set.name}/>
            </ListItem>
        ));
    }

    renderQuestionList() {
        if (this.props.selection.mode !== null) {
            const id =
                this.props.selection.mode === 'question' && this.props.sets[this.props.selection.s].questions[this.props.selection.q]
                    ? this.props.sets[this.props.selection.s].questions[this.props.selection.q]
                        .questionID
                    : -1;
            return this.props.sets[this.props.selection.s].questions.map((question, index) => (
                <ListItem
                    key={question.questionID + '-' + index}
                    button
                    onClick={() => this.selectQuestion(index)}
                    disabled={question.config && Object.keys(question.config).length > 0}
                >
                    <ListItemIcon>
                        <QuestionIcon color={id === question.questionID ? 'primary' : 'action'}/>
                    </ListItemIcon>
                    <ListItemText secondary={question.name}/>
                </ListItem>
            ));
        }
    }

    renderQuestionPreview() {
        let {preview} = this.state;
        if (this.props.selection.mode === 'question')
            return (
                <Fragment key='ManagerPreview'>
                    <Content>{preview.prompt}</Content>
                    {preview.prompts.map((x, y) => (
                        <Fragment key={uniqueKey()}>
                            <Divider style={{marginTop: '10px', marginBottom: '10px'}}/>
                            <AnswerInput disabled type={preview.types[y]} prompt={x}/>
                        </Fragment>
                    ))}
                    {preview.explanation.map(x => (
                        <Fragment key={uniqueKey()}>
                            <Divider style={{marginTop: '10px', marginBottom: '10px'}}/>
                            <div style={{position: 'relative'}}>
                                <Content>{x}</Content>
                            </div>
                        </Fragment>
                    ))}
                </Fragment>
            );
    }

    selectQuestion(index: number) {
        if (this.props.selection.mode === null) return;
        const s = this.props.selection.s;
        Http.sampleQuestion(
            this.props.sets[s].questions[index].string,
            0,
            result => this.setState({preview: result}, this.props.selectQuestion(s, index)),
            () => undefined,
        );
    }

    newSet = () => {
        const {course, setName} = this.state;
        if (course && setName) {
            Http.newSet(
                course,
                setName,
                () => this.getSets(),
                result => alert(result.error),
            );
            this.setState({addDiagOpen: false, setName: ''});
        }
    };

    renameSet() {
        if (this.props.selection.mode !== null) {
            let name = prompt('Set name:', this.props.sets[this.props.selection.s].name);
            if (name !== '' && name !== null) {
                Http.renameSet(
                    this.props.sets[this.props.selection.s].setID,
                    name,
                    this.getSets,
                    result => alert(result.error),
                );
            }
        }
    }

    deleteSet() {
        if (
            this.props.selection.mode !== null &&
            confirm('Are you sure you want to delete this set?')
        )
            Http.deleteSet(
                this.props.sets[this.props.selection.s].setID,
                () => {
                    this.props.deselect();
                    this.getSets();
                },
                result => alert(result.error),
            );
    }

    newQuestion() {
        if (this.props.selection.mode !== null) {
            Http.newQuestion(
                this.props.sets[this.props.selection.s].setID,
                'New question',
                '-3 3 1 3 1 AC，2 3 0 AB，-2 2 1 3 1 AC；$1，$2，$3；$1 _A，$2 _A，$3 _A；Compute the vector ' +
                'sum \\({0}+{1}{2}\\).，；6；1；@0 $1 $2 $3 CD CB CN；The first step is to multiply the vector by the ' +
                'scalar, which you can do by multiplying each number in the vector. The second step is to add the ' +
                'result to the other vector, by adding each corresponding pair of numbers.；，，',
                1,
                1,
                () => this.getSets(),
                () => alert("The question couldn't be created."),
            );
        }
    }

    renameQuestion() {
        if (this.props.selection.mode !== 'question') return;
        let name = prompt(
            'Question name:',
            this.props.sets[this.props.selection.s].questions[this.props.selection.q].name,
        );
        if (name !== '' && name !== null) {
            Http.renameQuestion(
                this.props.sets[this.props.selection.s].questions[this.props.selection.q]
                    .questionID,
                name,
                () => this.getSets(),
                result => alert(result.error),
            );
        }
    }

    deleteQuestion() {
        if (
            this.props.selection.mode === 'question' &&
            confirm('Are you sure you want to delete this question?')
        ) {
            Http.deleteQuestion(
                this.props.sets[this.props.selection.s].questions[this.props.selection.q]
                    .questionID,
                this.getSets,
                result => alert(result.error),
            );
        }
    }

    copyQuestion() {
        if (this.props.selection.mode === 'question') {
            this.setState({copiedQ: this.props.selection});
        }
    }

    pasteQuestion() {
        if (this.state.copiedQ) {
            const question = this.props.sets[this.state.copiedQ.s].questions[this.state.copiedQ.q];
            if (this.props.selection.mode !== null) {
                Http.newQuestion(
                    this.props.sets[this.props.selection.s].setID,
                    question.name,
                    question.string,
                    question.answers,
                    question.total,
                    this.getSets,
                    () =>
                        this.props.showSnackBar('error', "The question couldn't be created.", 3000),
                );
            }
        }
    }
}
