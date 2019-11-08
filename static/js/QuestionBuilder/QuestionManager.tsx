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
    DialogTitle,
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
import {getMathJax} from '../HelperFunctions/Utilities';
import {AnswerInput} from '../AnswerInput';
import {ShowSnackBar} from '../Layout/Layout';
import {QuestionSet, Course} from '../Http/types';

export interface QuestionManagerProps {
    s: number | null;
    q: number | null;
    sets: QuestionSet[];
    courses: Course[];
    initBuilder: (s: number, q: number, sets: QuestionSet[]) => void;
    showSnackBar: ShowSnackBar;
    returnHome: () => void;
}

export interface QuestionManagerState {
    selectedS: number | null;
    selectedQ: number | null;
    copiedQ: null | [number, number];
    sets: QuestionSet[];
    preview: {
        prompt: string;
        prompts: string[];
        types: string[];
        explanation: string[];
        variables: {[variable: string]: string};
    };
    addDiagOpen: boolean;
    course: number;
    setName: string;
}

export default class QuestionManager extends Component<QuestionManagerProps, QuestionManagerState> {
    constructor(props: QuestionManagerProps) {
        super(props);
        this.state = {
            selectedS: this.props.s, // Selected Set
            selectedQ: null, // Selected Question
            copiedQ: null, // [Set, Question]
            sets: this.props.sets,
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
        if (this.props.q !== null) {
            this.selectQuestion(this.props.q);
        }
    }

    getSets = () => {
        Http.getSets(
            result => this.setState({sets: result.sets}),
            () => alert('Something went wrong when retrieving your question list'),
        );
    };

    render() {
        let {selectedS, selectedQ} = this.state;
        let canEdit = selectedS !== null && this.state.sets[selectedS].canEdit;
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
                                <ArrowBack />
                            </IconButton>
                            <IconButton onClick={() => this.setState({addDiagOpen: true})}>
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
                                    <ListItemIcon>
                                        <PasteIcon color='action' />
                                    </ListItemIcon>
                                    <ListItemText
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
                                    <ListItemIcon>
                                        <Delete color='action' />
                                    </ListItemIcon>
                                    <ListItemText secondary='Clear Clipboard' />
                                </ListItem>
                            </Fragment>
                        ) : null}
                        {selectedS !== null && !this.state.sets[selectedS].canEdit ? (
                            <Fragment>
                                <Divider />
                                <ListItem key='paste'>
                                    <ListItemIcon>
                                        <Warning color='action' />
                                    </ListItemIcon>
                                    <ListItemText secondary='This set is locked' />
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
                        {this.props.courses.map(course => (
                            <ListItem
                                button
                                onClick={() => this.setState({course: course.courseID})}
                                key={course.courseID}
                                selected={course.courseID === this.state.course}
                            >
                                <ListItemText primary={course.name} />
                            </ListItem>
                        ))}
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
        let {selectedS} = this.state;
        return this.state.sets.map((set, index) => (
            <ListItem key={set.setID + '-' + index} button onClick={() => this.selectSet(index)}>
                <ListItemIcon>
                    {set.canEdit ? (
                        <Folder color={selectedS === index ? 'primary' : 'action'} />
                    ) : (
                        <Lock color={selectedS === index ? 'primary' : 'action'} />
                    )}
                </ListItemIcon>
                <ListItemText primary={set.name} />
            </ListItem>
        ));
    }

    renderQuestionList() {
        if (this.state.selectedS !== null)
            return this.state.sets[this.state.selectedS].questions.map((question, index) => (
                <ListItem
                    key={question.questionID + '-' + index}
                    button
                    onClick={() => this.selectQuestion(index)}
                >
                    <ListItemIcon>
                        <QuestionIcon
                            color={this.state.selectedQ === index ? 'primary' : 'action'}
                        />
                    </ListItemIcon>
                    <ListItemText secondary={question.name} />
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
            result => this.setState({selectedQ: index, preview: result}),
            () => undefined,
        );
    }

    newSet = () => {
        Http.newSet(
            this.state.course,
            this.state.setName,
            () => this.getSets(),
            result => alert(result.error),
        );
        this.setState({addDiagOpen: false, setName: ''});
    };

    renameSet() {
        let set = this.state.sets[this.state.selectedS as number];
        let name = prompt('Set name:', set.name);
        if (name !== '' && name !== null)
            Http.renameSet(set.setID, name, () => this.getSets(), result => alert(result.error));
    }

    deleteSet() {
        let set = this.state.sets[this.state.selectedS as number];
        let confirmation = confirm('Are you sure you want to delete this set?');
        if (confirmation)
            Http.deleteSet(
                set.setID,
                async () => {
                    await this.setState({selectedS: null, selectedQ: null});
                    this.getSets();
                },
                result => alert(result.error),
            );
    }

    newQuestion() {
        Http.newQuestion(
            this.state.sets[this.state.selectedS as number].setID,
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
            Http.renameQuestion(
                question.questionID,
                name,
                () => this.getSets(),
                result => alert(result.error),
            );
    }

    editQuestion() {
        const {selectedS, selectedQ, sets} = this.state;
        this.props.initBuilder(selectedS as number, selectedQ as number, sets);
    }

    deleteQuestion() {
        let set = this.state.sets[this.state.selectedS as number];
        let question = set.questions[this.state.selectedQ as number];
        let confirmation = confirm('Are you sure you want to delete this question?');
        if (confirmation)
            Http.deleteQuestion(question.questionID, () => this.getSets(), result => alert(result.error));
    }

    copyQuestion() {
        this.setState({copiedQ: [this.state.selectedS as number, this.state.selectedQ as number]});
    }

    pasteQuestion() {
        const copied = this.state.copiedQ as [number, number];
        const question = this.state.sets[copied[0]].questions[copied[1]];
        Http.newQuestion(
            this.state.sets[this.state.selectedS as number].setID,
            question.name,
            question.string,
            question.answers,
            question.total,
            this.getSets,
            () => this.props.showSnackBar('error', "The question couldn't be created.", 3000),
        );
    }
}
