import React, {Component} from 'react';
import * as Http from '../Http';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Slide from '@material-ui/core/Slide';
import Paper from '@material-ui/core/Paper';
import Grow from '@material-ui/core/Grow';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import Folder from '@material-ui/icons/Folder';
import Lock from '@material-ui/icons/Lock';
import DeleteIcon from '@material-ui/icons/Delete';
import Fab from '@material-ui/core/Fab';
import {
    InsertDriveFile as QuestionIcon,
    ArrowBack,
    CreateNewFolder,
    AssignmentReturnedOutlined,
} from '@material-ui/icons/';
import {ListItem, ListItemText, ListItemIcon, Popover, List} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Question, QuestionSet, Course} from 'Http/types';
import {ShowSnackBar} from 'Layout/Layout';
import TFImporter from './TFImporter';

export interface TrueFalseBuilderProps {
    showSnackBar: ShowSnackBar;
    sets: QuestionSet[];
    courses: Course[];
    returnHome: () => void;
}

interface TrueFalseBuilderState {
    loaded: boolean;
    questionID: number;
    questionName: string;
    questionNmeE: boolean;
    questionText: string;
    questionTxtE: boolean;
    questionAnsr: 'true' | 'false';
    questionExpl: string;
    questionExpE: boolean;
    sets: QuestionSet[];
    setsActive: boolean;
    setQActive: boolean;
    selectedS: null | number;
    selectedSName: string;
    popopen: boolean;
    anchorEl: null | HTMLElement;
    switchDiagOpen: boolean;
    deleteDiagOpen: boolean;
    addDiagOpen: boolean;
    editMode: boolean;
    changed: boolean;
    nextQuestion: null | Question;
    hovered: number;
    course: number;
    setName: string;
    importerOpen: boolean;
}

export default class TrueFalseBuilder extends Component<
    TrueFalseBuilderProps,
    TrueFalseBuilderState
> {
    constructor(props: TrueFalseBuilderProps) {
        super(props);
        this.state = {
            loaded: false, // Checks if the page has had all required data loaded
            questionID: -1, // Only used in edit mode to edit the question
            questionName: '', // Stores the question Name string
            questionNmeE: true, // Keeps track of whether or not we're editing the question name
            questionText: '', // Stores the questions Prompt string
            questionTxtE: true, // Keeps track of if we're editing the prompt
            questionAnsr: 'true', // Stores whether the answer is true or false
            questionExpl: '', // Stores the question Explanation String
            questionExpE: true, // Keeps track of if we're editing the explanation string
            sets: this.props.sets,
            setsActive: false,
            setQActive: false,
            selectedS: null, // Selected Set
            selectedSName: '',
            popopen: false,
            anchorEl: null,
            switchDiagOpen: false,
            deleteDiagOpen: false,
            addDiagOpen: false,
            editMode: false,
            changed: false,
            nextQuestion: null, // Used to store a selected question that hasn't been loaded
            hovered: -1, // The ID of the current question being hovered
            course: -1,
            setName: '',
            importerOpen: false, // Determines whether we are showing the question importer
        };
    }

    render() {
        return (
            <Grid container xs={12}>
                <Grid item xs={3}>
                    <Slide in={this.state.loaded} direction='right' mountOnEnter unmountOnExit>
                        <Paper
                            className='avo-sidebar'
                            style={{
                                height: 'calc(100vh - 65px)',
                                overflowY: 'auto',
                            }}
                        >
                            <ListItem>
                                {this.state.setsActive && (
                                    <ListItemIcon>
                                        <IconButton
                                            aria-label='go back'
                                            size='small'
                                            onClick={this.props.returnHome}
                                        >
                                            <ArrowBack />
                                        </IconButton>
                                    </ListItemIcon>
                                )}
                                {this.state.setQActive && (
                                    <ListItemIcon>
                                        <IconButton
                                            aria-label='go back'
                                            size='small'
                                            onClick={() => this.goBackToSets()}
                                        >
                                            <ArrowBack
                                                onClick={() => this.setState({questionID: -1})}
                                            />
                                        </IconButton>
                                    </ListItemIcon>
                                )}
                                <ListItemText
                                    primary={
                                        this.state.setQActive
                                            ? this.state.selectedSName
                                            : 'Question Sets'
                                    }
                                />
                                {this.state.setsActive && (
                                    <IconButton
                                        size='small'
                                        edge='end'
                                        onClick={() => this.setState({addDiagOpen: true})}
                                    >
                                        <CreateNewFolder />
                                    </IconButton>
                                )}
                                {this.state.setQActive && (
                                    <IconButton
                                        size='small'
                                        edge='end'
                                        onClick={() => this.setState({importerOpen: true})}
                                    >
                                        <AssignmentReturnedOutlined />
                                    </IconButton>
                                )}
                            </ListItem>
                            <Divider />
                            <Slide
                                in={this.state.setsActive}
                                direction='right'
                                mountOnEnter
                                unmountOnExit
                            >
                                <div>{this.renderSetList()}</div>
                            </Slide>
                            <Slide
                                in={this.state.setQActive}
                                direction='right'
                                mountOnEnter
                                unmountOnExit
                            >
                                <div>{this.renderQuestionList()}</div>
                            </Slide>
                        </Paper>
                    </Slide>
                </Grid>
                <Grid item xs={9}>
                    <Grow in={this.state.loaded}>
                        <Paper
                            className='avo-card'
                            style={{
                                height: 'auto',
                                width: 'auto',
                                maxHeight: '100%',
                            }}
                        >
                            {this.state.questionNmeE ? (
                                <span>
                                    <TextField
                                        id='outlined-name'
                                        label='Question Name'
                                        margin='normal'
                                        variant='outlined'
                                        value={this.state.questionName}
                                        onChange={e =>
                                            this.setState({
                                                changed: true,
                                                questionName: e.target.value,
                                            })
                                        }
                                    />
                                    <IconButton
                                        aria-label='save'
                                        size='small'
                                        onClick={() => this.setState({questionNmeE: false})}
                                    >
                                        <SaveIcon fontSize='inherit' />
                                    </IconButton>
                                </span>
                            ) : (
                                <span>
                                    <span style={{float: 'left'}}>
                                        <Typography
                                            variant='h5'
                                            style={{fontWeight: 'bold'}}
                                            gutterBottom
                                        >
                                            {this.state.questionName}
                                        </Typography>
                                    </span>
                                    <span>
                                        <IconButton
                                            aria-label='edit'
                                            size='small'
                                            onClick={() => this.setState({questionNmeE: true})}
                                        >
                                            <EditIcon fontSize='inherit' />
                                        </IconButton>
                                    </span>
                                </span>
                            )}
                            <br />
                            <br />
                            {this.state.questionTxtE ? (
                                <span>
                                    <TextField
                                        id='outlined-name'
                                        label='Question Prompt'
                                        multiline
                                        rows='2'
                                        margin='normal'
                                        variant='outlined'
                                        style={{
                                            width: '90%',
                                        }}
                                        value={this.state.questionText}
                                        onChange={e =>
                                            this.setState({
                                                changed: true,
                                                questionText: e.target.value,
                                            })
                                        }
                                    />
                                    <IconButton
                                        aria-label='save'
                                        size='small'
                                        onClick={() => this.setState({questionTxtE: false})}
                                    >
                                        <SaveIcon fontSize='inherit' />
                                    </IconButton>
                                </span>
                            ) : (
                                <span>
                                    <span style={{float: 'left'}}>
                                        <Typography variant='body2' gutterBottom>
                                            {this.state.questionText}
                                        </Typography>
                                    </span>
                                    <span>
                                        <IconButton
                                            aria-label='edit'
                                            size='small'
                                            onClick={() => this.setState({questionTxtE: true})}
                                        >
                                            <EditIcon fontSize='inherit' />
                                        </IconButton>
                                    </span>
                                </span>
                            )}
                            <br />
                            <br />
                            <FormControl component='fieldset'>
                                <FormLabel component='legend'>Answer Choices</FormLabel>
                                <RadioGroup
                                    aria-label='true false input'
                                    name='choices'
                                    value={this.state.questionAnsr}
                                    onChange={event =>
                                        this.handleAnswerChange((event.target as HTMLInputElement)
                                            .value as 'true' | 'false')
                                    }
                                >
                                    <FormControlLabel
                                        value='true'
                                        control={<Radio color='primary' />}
                                        label='True'
                                        labelPlacement='end'
                                    />
                                    <FormControlLabel
                                        value='false'
                                        control={<Radio color='primary' />}
                                        label='False'
                                        labelPlacement='end'
                                    />
                                </RadioGroup>
                            </FormControl>
                            <br />
                            {this.state.questionExpE ? (
                                <span>
                                    <TextField
                                        id='outlined-name'
                                        label={`Explanation as to why the answer is ${this.state.questionAnsr}`}
                                        multiline
                                        rows='2'
                                        margin='normal'
                                        variant='outlined'
                                        style={{
                                            width: '90%',
                                        }}
                                        value={this.state.questionExpl}
                                        onChange={e =>
                                            this.setState({
                                                changed: true,
                                                questionExpl: e.target.value,
                                            })
                                        }
                                    />
                                    <IconButton
                                        aria-label='save'
                                        size='small'
                                        onClick={() => this.setState({questionExpE: false})}
                                    >
                                        <SaveIcon fontSize='inherit' />
                                    </IconButton>
                                </span>
                            ) : (
                                <span>
                                    <span style={{float: 'left'}}>
                                        <Typography variant='body2' gutterBottom>
                                            {this.state.questionExpl}
                                        </Typography>
                                    </span>
                                    <span>
                                        <IconButton
                                            aria-label='edit'
                                            size='small'
                                            onClick={() => this.setState({questionExpE: true})}
                                        >
                                            <EditIcon fontSize='inherit' />
                                        </IconButton>
                                    </span>
                                </span>
                            )}
                        </Paper>
                    </Grow>
                    <div
                        style={{position: 'absolute', bottom: '1em', right: '1em'}}
                        onMouseEnter={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            this.handleSaveMouseEnter(event)
                        }
                    >
                        <Fab
                            color='primary'
                            disabled={!this.isValid()}
                            onClick={() => this.submitQuestion()}
                        >
                            <SaveIcon />
                        </Fab>
                        <Popover
                            open={this.state.popopen}
                            anchorEl={this.state.anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                            PaperProps={{
                                onMouseLeave: () => this.setState({anchorEl: null, popopen: false}),
                                style: {padding: '10px'},
                            }}
                        >
                            <Typography variant='h6'>
                                In order to save, you must complete the following:
                            </Typography>
                            <ul>{this.getSaveRequirementList()}</ul>
                        </Popover>
                    </div>
                </Grid>
                <Dialog
                    open={this.state.switchDiagOpen}
                    onClose={() => this.setState({switchDiagOpen: false})}
                    aria-labelledby='switch-question-title'
                    aria-describedby='switch-question-description'
                >
                    <DialogTitle id='switch-question-title'>Switch questions?</DialogTitle>
                    <DialogContent>
                        <DialogContentText id='switch-question-description'>
                            Switching questions will overwrite your current work.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => this.setState({switchDiagOpen: false})}
                            color='primary'
                            variant='outlined'
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                this.setState({switchDiagOpen: false});
                                if (this.state.nextQuestion !== null)
                                    this.loadQuestion(this.state.nextQuestion);
                            }}
                            color='primary'
                            variant='contained'
                            autoFocus
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.deleteDiagOpen}
                    onClose={() => this.setState({deleteDiagOpen: false})}
                    aria-labelledby='delete-question-title'
                    aria-describedby='delete-question-description'
                >
                    <DialogTitle id='delete-question-title'>Delete question?</DialogTitle>
                    <DialogContent>
                        <DialogContentText id='delete-question-description'>
                            Are you sure you want to delete the question?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => this.setState({deleteDiagOpen: false})}
                            color='primary'
                            variant='outlined'
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                this.setState({deleteDiagOpen: false});
                                if (this.state.nextQuestion !== null)
                                    this.deleteQuestion(this.state.nextQuestion);
                            }}
                            color='primary'
                            variant='contained'
                            autoFocus
                        >
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    onClose={() => this.closeAddSetDialog()}
                    aria-labelledby='select-course-dialog'
                    open={this.state.addDiagOpen}
                >
                    <DialogTitle id='select-course-dialog'>Add a new set</DialogTitle>
                    <List>
                        <ListItem>
                            <FormControl>
                                <InputLabel id='add-set-select-label'>Course</InputLabel>
                                {this.renderAddSetSelect()}
                            </FormControl>
                        </ListItem>
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
                            <Button
                                color='primary'
                                disabled={this.state.course === -1}
                                onClick={() => this.newSet()}
                            >
                                Add Set
                            </Button>
                            <Button color='primary' onClick={() => this.closeAddSetDialog()}>
                                Cancel
                            </Button>
                        </ListItem>
                    </List>
                </Dialog>
                <Dialog
                    onClose={() => this.setState({importerOpen: false})}
                    aria-labelledby='true-false-importer-dialog'
                    open={this.state.importerOpen}
                    maxWidth='xl'
                >
                    <TFImporter
                        set={this.state.sets[this.state.selectedS as number]}
                        close={() => this.setState({importerOpen: false})}
                    />
                </Dialog>
            </Grid>
        );
    }

    renderSetList = () => {
        let {selectedS} = this.state;
        return this.state.sets.map((set, index) => (
            <ListItem
                key={set.setID + '-' + index}
                button
                onClick={() => this.selectSet(set, index)}
                onMouseEnter={() => this.setState({hovered: index})}
                onMouseLeave={() => this.setState({hovered: -1})}
                disabled={!set.canEdit}
            >
                <ListItemIcon>
                    {set.canEdit ? (
                        <Folder color={selectedS === index ? 'primary' : 'action'} />
                    ) : (
                        <Lock color={selectedS === index ? 'primary' : 'action'} />
                    )}
                </ListItemIcon>
                <ListItemText primary={set.name} />
                {index === this.state.hovered && (
                    <IconButton
                        size='small'
                        edge='end'
                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                            this.deleteSet(index, event)
                        }
                    >
                        <DeleteIcon />
                    </IconButton>
                )}
            </ListItem>
        ));
    };

    renderQuestionList = () => {
        const {selectedS, sets, questionID, hovered} = this.state;
        if (selectedS !== null)
            return sets[selectedS as number].questions.map((question: Question, index: number) => (
                <ListItem
                    disabled={!isTrueFalse(question.string)}
                    key={question.questionID + '-' + index}
                    button
                    onMouseEnter={() => this.setState({hovered: question.questionID})}
                    onMouseLeave={() => this.setState({hovered: -1})}
                    onClick={() => this.setState({nextQuestion: question})}
                >
                    <ListItemIcon>
                        <QuestionIcon
                            color={questionID === question.questionID ? 'primary' : 'action'}
                        />
                    </ListItemIcon>
                    <ListItemText secondary={question.name} />
                    {hovered === question.questionID && (
                        <IconButton
                            size='small'
                            edge='end'
                            onClick={() => this.switchQuestion(question)}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                    {hovered === question.questionID && (
                        <IconButton
                            size='small'
                            edge='end'
                            onClick={() => this.setState({deleteDiagOpen: true})}
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}
                </ListItem>
            ));
    };

    getSaveRequirementList = () => {
        const list = [];
        if (this.state.questionNmeE)
            list.push(
                <li>
                    <Typography>Save the question name</Typography>
                </li>,
            );
        if (this.state.questionTxtE)
            list.push(
                <li>
                    <Typography>Save the question prompt</Typography>
                </li>,
            );
        if (this.state.questionExpE)
            list.push(
                <li>
                    <Typography>Save the explanation</Typography>
                </li>,
            );
        if (this.state.setsActive)
            list.push(
                <li>
                    <Typography>Select a question set</Typography>
                </li>,
            );

        return list;
    };

    componentDidMount = () => {
        this.setState({loaded: true});
        this.getSets();
    };

    selectSet = (set: QuestionSet, index: number) => {
        this.setState({selectedS: index, selectedSName: set.name, setsActive: false});
        setTimeout(() => {
            this.setState({setQActive: true});
        }, 500);
    };

    goBackToSets = () => {
        this.setState({setQActive: false});
        setTimeout(() => {
            this.setState({setsActive: true});
        }, 500);
    };

    getSets = () => {
        Http.getSets(
            result => {
                this.setState({sets: result.sets, setsActive: true});
                console.log(result);
            },
            () => alert('Something went wrong when retrieving your question list'),
        );
    };

    refreshSets = () => {
        Http.getSets(
            result => this.setState({sets: result.sets}),
            () => alert('Something went wrong when retrieving your question list'),
        );
    };

    newSet = () => {
        Http.newSet(
            this.state.course,
            this.state.setName,
            () => this.refreshSets(),
            result => alert(result.error),
        );
        this.closeAddSetDialog();
    };

    deleteSet = (index: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        let set = this.state.sets[index];
        let confirmation: boolean = confirm('Are you sure you want to delete this set?');
        if (confirmation)
            Http.deleteSet(
                set.setID,
                async () => {
                    await this.setState({selectedS: null, questionID: -1});
                    this.getSets();
                },
                result => alert(result.error),
            );
    };

    handleAnswerChange = (answer: 'true' | 'false') => {
        this.setState({questionAnsr: answer, changed: true});
    };

    handleSaveMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!this.isValid()) {
            this.setState({popopen: true, anchorEl: event.currentTarget});
        }
    };

    buildQuestionString = () => {
        return (
            '；；；' +
            this.state.questionText +
            '，；0；1；@0 *' +
            (this.state.questionAnsr === 'true' ? 'T' : 'F') +
            ' HB；' +
            this.state.questionExpl +
            '；'
        );
    };

    submitQuestion = () => {
        if (this.state.editMode) {
            Http.renameQuestion(
                this.state.questionID,
                this.state.questionName,
                () =>
                    Http.editQuestion(
                        this.state.questionID,
                        this.buildQuestionString(),
                        1,
                        1,
                        () => this.postSuccess(),
                        () => this.props.showSnackBar('error', 'Error editing question', 2000),
                    ),
                () => this.props.showSnackBar('error', 'Error editing question', 2000),
            );
        } else {
            Http.newQuestion(
                this.state.sets[this.state.selectedS as number].setID,
                this.state.questionName,
                this.buildQuestionString(),
                1,
                1,
                () => this.postSuccess(),
                () => this.props.showSnackBar('error', 'Error creating question', 2000),
            );
        }
    };

    postSuccess = () => {
        if (this.state.editMode)
            this.props.showSnackBar('success', 'Question edited successfully', 2000);
        else this.props.showSnackBar('success', 'Question created successfully', 2000);
        this.reset();
    };

    deleteSuccess = (question: Question) => {
        this.props.showSnackBar('success', 'Question deleted', 2000);
        if (question.questionID === this.state.questionID) this.reset();
        else this.refreshSets();
    };

    switchQuestion = (question: Question) => {
        if (this.state.changed) {
            this.setState({switchDiagOpen: true});
        } else {
            this.loadQuestion(question);
        }
    };

    loadQuestion = (question: Question) => {
        if (!isTrueFalse(question.string)) {
            this.props.showSnackBar(
                'error',
                'This question is not true/false or contains math',
                2000,
            );
        } else {
            const tfRegex: RegExp = /；；；([^；，]*)，；0；[^；]*；@0 \*([TF]) HB；([^；]*)；/;
            const match: RegExpMatchArray | null = question.string.match(tfRegex);
            if (match !== null) {
                this.setState({
                    questionID: question.questionID,
                    questionName: question.name,
                    questionNmeE: false,
                    questionText: match[1],
                    questionTxtE: false,
                    questionAnsr: match[2] === 'T' ? 'true' : 'false',
                    questionExpl: match[3],
                    questionExpE: false,
                    editMode: true,
                    changed: false,
                });
            }
        }
    };

    deleteQuestion = (question: Question) => {
        Http.deleteQuestion(
            question.questionID,
            () => this.deleteSuccess(question),
            () => this.props.showSnackBar('error', 'An error occured', 2000),
        );
    };

    reset = () => {
        // Reload the default state
        this.setState({
            questionID: -1,
            questionName: '',
            questionNmeE: true,
            questionText: '',
            questionTxtE: true,
            questionAnsr: 'true',
            questionExpl: '',
            questionExpE: true,
            editMode: false,
            changed: false,
        });

        this.refreshSets();
    };

    isValid = () => {
        return (
            this.state.loaded &&
            !!this.state.questionName &&
            this.state.setQActive &&
            !this.state.questionNmeE &&
            !this.state.questionTxtE &&
            !this.state.questionExpE
        );
    };

    closeAddSetDialog = () => {
        this.setState({addDiagOpen: false, setName: '', course: -1});
    };

    // Had to move this to a function so ts-ignore wouldn't display on the page
    renderAddSetSelect = () => {
        // Currently an error with TS believing there is no lablelId prop on Select
        return (
            // @ts-ignore
            <Select
                labelId='add-set-select-label'
                id='demo-simple-select'
                value={this.state.course}
                onChange={(event: any) => this.setState({course: event.target.value})}
            >
                <MenuItem value={-1}>--Select a course--</MenuItem>
                {this.props.courses.map(course => {
                    if (course.canEdit) {
                        return <MenuItem value={course.courseID}>{course.name}</MenuItem>;
                    }
                })}
            </Select>
        );
    };
}

function isTrueFalse(string: string): boolean {
    const tfRegex = /；；；[^；，]*，；0；[^；]*；@0 \*[TF] HB；[^；]*；/;
    return !!string.match(tfRegex);
}
