import React, {Component} from 'react';
import * as Http from '../Http';
import {
    Add as AddIcon,
    ArrowBack,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Folder,
    InsertDriveFile as QuestionIcon,
    Lock,
    Save as SaveIcon,
    CreateNewFolder,
} from '@material-ui/icons';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Fab,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    Grow,
    IconButton,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Popover,
    Radio,
    RadioGroup,
    Slide,
    TextField,
    Typography,
    List,
    InputLabel,
    Select,
    MenuItem,
} from '@material-ui/core';
import {QuestionSet, Question, Course} from '../Http/types';
import {ShowSnackBar} from '../Layout/Layout';

export interface MultipleChoiceBuilderProps {
    showSnackBar: ShowSnackBar;
    sets: QuestionSet[];
    courses: Course[];
    updateSets: (questionSets: QuestionSet[], cb?: () => void) => void;
    returnHome: () => void;
}

interface MultipleChoiceBuilderState {
    loaded: boolean;
    questionID: number;
    questionName: string;
    questionNmeE: boolean;
    questionText: string;
    questionTxtE: boolean;
    questionOpts: string[];
    questionEdit: boolean[];
    questionAnsr: number;
    questionExpl: string;
    questionExpE: boolean;
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
    toEdit: null | number;
    hovered: number;
    course: number;
    setName: string;
}

export default class MultipleChoiceBuilder extends Component<
    MultipleChoiceBuilderProps,
    MultipleChoiceBuilderState
> {
    constructor(props: MultipleChoiceBuilderProps) {
        super(props);
        this.state = {
            loaded: false, // Checks if the page has had all required data loaded
            questionID: -1, // Only used in edit mode to edit the question
            questionName: '', // Stores the question Name string
            questionNmeE: true, // Keeps track of whether or not we're editing the question name
            questionText: '', // Stores the questions Prompt string
            questionTxtE: true, // Keeps track of if we're editing the prompt
            questionOpts: ['Option 1', 'Option 2', 'Option 3'], // Stores the questions MC options
            questionEdit: [false, false, false], // Stores Which one the above mentioned choices we're editing
            questionAnsr: 0, // Stores the index of the correct options for the test
            questionExpl: '', // Stores the question Explanation String
            questionExpE: true, // Keeps track of if we're editing the explanation string
            setsActive: false,
            setQActive: false,
            selectedS: null,
            selectedSName: '',
            popopen: false,
            anchorEl: null,
            switchDiagOpen: false,
            deleteDiagOpen: false,
            addDiagOpen: false,
            editMode: false,
            changed: false,
            toEdit: null, // The index (within the set) of the question to edit or delete
            hovered: -1, // The ID of the current question being hovered
            course: -1, // The courseID for sets to be added to
            setName: '', // The name for a new set
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
                                // Compensate for padding and margin
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
                                            onClick={
                                                // The back button will either take you back to the set list
                                                // or back to the homepage
                                                this.state.setQActive
                                                    ? () => this.goBackToSets()
                                                    : () => this.props.returnHome()
                                            }
                                        >
                                            <ArrowBack />
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
                <Grid item xs={9} style={{position: 'relative'}}>
                    <Grow in={this.state.loaded}>
                        <Paper
                            className='avo-card'
                            style={{
                                height: 'auto',
                                width: 'auto',
                                maxHeight: '100%',
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                bottom: '0',
                                left: '0',
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
                                    aria-label='multiple choice input'
                                    name='choices'
                                    value={'' + this.state.questionAnsr}
                                >
                                    {this.state.questionOpts.map((string, index) => {
                                        return (
                                            <FormControlLabel
                                                value={'' + index}
                                                control={
                                                    <Radio
                                                        color='primary'
                                                        onClick={() =>
                                                            this.setState({questionAnsr: index})
                                                        }
                                                    />
                                                }
                                                label={
                                                    <span>
                                                        {this.state.questionEdit[index] ? (
                                                            <span>
                                                                <TextField
                                                                    label={`Edit Choice #${index +
                                                                        1}`}
                                                                    onChange={e => {
                                                                        let newArr = this.state
                                                                            .questionOpts;
                                                                        newArr[index] =
                                                                            e.target.value;
                                                                        this.setState({
                                                                            changed: true,
                                                                            questionOpts: newArr,
                                                                        });
                                                                    }}
                                                                    margin='normal'
                                                                    variant='outlined'
                                                                    value={string}
                                                                />
                                                                <IconButton
                                                                    aria-label='edit'
                                                                    size='small'
                                                                    onClick={() => {
                                                                        let newArr = this.state
                                                                            .questionEdit;
                                                                        newArr[index] = !newArr[
                                                                            index
                                                                        ];
                                                                        this.setState({
                                                                            questionEdit: newArr,
                                                                        });
                                                                    }}
                                                                >
                                                                    <SaveIcon fontSize='inherit' />
                                                                </IconButton>
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                {string}
                                                                <IconButton
                                                                    aria-label='edit'
                                                                    size='small'
                                                                    onClick={() => {
                                                                        let newArr = this.state
                                                                            .questionEdit;
                                                                        newArr[index] = !newArr[
                                                                            index
                                                                        ];
                                                                        this.setState({
                                                                            questionEdit: newArr,
                                                                        });
                                                                    }}
                                                                >
                                                                    <EditIcon fontSize='inherit' />
                                                                </IconButton>
                                                                <IconButton
                                                                    aria-label='delete'
                                                                    size='small'
                                                                    onClick={() => {
                                                                        let newArrQE = this.state
                                                                            .questionEdit;
                                                                        let newArrQO = this.state
                                                                            .questionOpts;
                                                                        newArrQE.splice(index, 1);
                                                                        newArrQO.splice(index, 1);
                                                                        this.setState({
                                                                            questionEdit: newArrQE,
                                                                            questionOpts: newArrQO,
                                                                        });
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize='inherit' />
                                                                </IconButton>
                                                            </span>
                                                        )}
                                                    </span>
                                                }
                                            />
                                        );
                                    })}
                                </RadioGroup>
                            </FormControl>
                            <br />
                            <Fab
                                variant='extended'
                                size='small'
                                color='primary'
                                aria-label='add'
                                onClick={() => {
                                    let newArrQE = this.state.questionEdit;
                                    let newArrQO = this.state.questionOpts;
                                    newArrQE.push(true);
                                    newArrQO.push('New Choice');
                                    this.setState({
                                        changed: true,
                                        questionEdit: newArrQE,
                                        questionOpts: newArrQO,
                                    });
                                }}
                            >
                                <AddIcon />
                                Add Choice
                            </Fab>
                            <br />
                            <br />
                            {this.state.questionExpE ? (
                                <span>
                                    <TextField
                                        id='outlined-name'
                                        label={`Explanation as to why the answer is ${
                                            this.state.questionOpts[this.state.questionAnsr]
                                        }`}
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
                                if (this.state.toEdit) {
                                    this.loadQuestion();
                                }
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
                                this.deleteQuestion();
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
            </Grid>
        );
    }

    renderSetList = () => {
        let {selectedS} = this.state;
        return this.props.sets.map((set, index) => (
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
        const {selectedS, questionID, hovered} = this.state;
        const {sets} = this.props;
        if (selectedS !== null)
            return sets[selectedS as number].questions.map((question: Question, index: number) => (
                <ListItem
                    disabled={!isMultipleChoice(question.string)}
                    key={question.questionID + '-' + index}
                    button
                    onMouseEnter={() => this.setState({hovered: question.questionID})}
                    onMouseLeave={() => this.setState({hovered: -1})}
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
                            onClick={() => this.switchQuestion(index)}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                    {hovered === question.questionID && (
                        <IconButton
                            size='small'
                            edge='end'
                            onClick={() => this.setState({deleteDiagOpen: true, toEdit: index})}
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
        if (this.state.questionEdit.includes(true))
            list.push(
                <li>
                    <Typography>Save all question answers</Typography>
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
        this.setState({loaded: true, setsActive: true});
    };

    selectSet = (set: {name: string}, index: number) => {
        this.setState({selectedS: index, selectedSName: set.name, setsActive: false});
        setTimeout(() => {
            this.setState({setQActive: true});
        }, 500);
    };

    goBackToSets = () => {
        this.setState({setQActive: false, questionID: -1});
        setTimeout(() => {
            this.setState({setsActive: true});
        }, 500);
    };

    newSet = () => {
        Http.newSet(
            this.state.course,
            this.state.setName,
            () =>
                Http.getSets(
                    result =>
                        this.props.updateSets(result.sets, () =>
                            this.props.showSnackBar('success', 'Set added', 2000),
                        ),
                    result => alert(result.error),
                ),
            result => alert(result.error),
        );
        this.closeAddSetDialog();
    };

    deleteSet = (index: number, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // We just want to click delete, not the button
        event.stopPropagation();
        let confirmation: boolean = confirm('Are you sure you want to delete this set?');
        const set: QuestionSet = this.props.sets[index];
        if (confirmation)
            Http.deleteSet(
                set.setID,
                () => this.deleteSetSuccess(index),
                result => alert(result.error),
            );
    };

    handleSaveMouseEnter = (event: any) => {
        if (!this.isValid()) {
            this.setState({popopen: true, anchorEl: event.currentTarget});
        }
    };

    buildQuestionString = () => {
        return (
            '；；；' +
            this.state.questionText +
            '，—' +
            this.state.questionOpts.join('—') +
            '；1；1；@0 ' +
            (this.state.questionAnsr + 1) +
            ' HA；' +
            this.state.questionExpl +
            '；，，'
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
                this.props.sets[this.state.selectedS as number].setID,
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
        // Editing a question
        // Here, we can figure out what changed and where, then update the sets manually
        if (this.state.editMode) {
            const {selectedS, toEdit, questionName} = this.state;
            const {sets} = this.props;
            const updated = sets.slice();
            let question: Question = updated[selectedS as number].questions[toEdit as number];
            question.name = questionName;
            question.string = this.buildQuestionString();
            this.props.updateSets(updated);
        }
        // Creating a fresh question
        else {
            // Must pull the set list to identify the question ID
            Http.getSets(
                result =>
                    this.props.updateSets(result.sets, () =>
                        this.props.showSnackBar('success', 'The question has been created', 2000),
                    ),
                () => this.props.showSnackBar('error', 'Something went wrong', 4000),
            );
        }

        this.reset();
    };

    deleteQuestionSuccess = (reset: boolean) => {
        const {selectedS, toEdit} = this.state;
        const {sets} = this.props;
        // Copy the set list
        let updated = sets.slice();
        // Remove the set from the set list
        updated[selectedS as number].questions.splice(toEdit as number, 1);
        this.props.updateSets(updated, () =>
            this.props.showSnackBar('success', 'Question deleted', 2000),
        );
        // If we are deleting the currently selected question, we must refresh the view
        if (reset) this.reset();
    };

    deleteSetSuccess = (setIndex: number) => {
        // Clone the set list
        let updated = this.props.sets.slice();
        // Remove the set from the list
        updated.splice(setIndex, 1);
        this.props.updateSets(updated, () =>
            this.props.showSnackBar('success', 'The set has been deleted', 2000),
        );
        // If we are deleting the set we are currently in and we are editing a question in that set, we should reset the view
        if (setIndex === this.state.selectedS && this.state.editMode) this.reset();
        this.setState({selectedS: null});
    };

    switchQuestion = (questionIndex: number) => {
        this.setState({toEdit: questionIndex});
        if (this.state.changed) {
            this.setState({switchDiagOpen: true});
        } else {
            this.loadQuestion(questionIndex);
        }
    };

    loadQuestion = (index?: number) => {
        const {selectedS, toEdit} = this.state;
        const {sets} = this.props;
        let question: Question;
        // Used if the user was presented with a dialog (aka they would have thrown away changes)
        if (index === null || index === undefined)
            question = sets[selectedS as number].questions[toEdit as number];
        // Used when immediately switching to the next question
        else question = sets[selectedS as number].questions[index];
        if (isMath(question.string)) {
            this.props.showSnackBar(
                'error',
                'Please use the Math question builder to edit questions with math code',
                2000,
            );
        } else if (!isMultipleChoice(question.string)) {
            this.props.showSnackBar('error', 'This question is not multiple choice', 2000);
        } else {
            const qEdit: boolean[] = [];
            const answers = getAnswers(question.string);
            answers.forEach(() => {
                qEdit.push(false);
            });
            this.setState({
                questionID: question.questionID,
                questionName: question.name,
                questionNmeE: false,
                questionText: getPrompt(question.string),
                questionTxtE: false,
                questionOpts: answers,
                questionEdit: qEdit,
                questionAnsr: getAnswerIndex(question.string),
                questionExpl: getExplanation(question.string),
                questionExpE: false,
                editMode: true,
                changed: false,
            });
        }
    };

    deleteQuestion = () => {
        const {selectedS, toEdit} = this.state;
        const {sets} = this.props;
        const question: Question = sets[selectedS as number].questions[toEdit as number];
        const reset: boolean = question.questionID === this.state.questionID;
        Http.deleteQuestion(
            question.questionID,
            () => this.deleteQuestionSuccess(reset),
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
            questionOpts: ['Option 1', 'Option 2', 'Option 3'],
            questionEdit: [false, false, false],
            questionAnsr: 0,
            questionExpl: '',
            questionExpE: true,
            editMode: false,
            changed: false,
        });
    };

    isValid = () => {
        return (
            this.state.loaded &&
            !!this.state.questionName &&
            this.state.setQActive &&
            !this.state.questionNmeE &&
            !this.state.questionTxtE &&
            !this.state.questionEdit.includes(true) &&
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

// Used to determine if the question string contains math
function isMath(string: string) {
    const stringParts = string.split('；');
    // Check that there is no math code in the question string
    return Boolean(stringParts[0] || stringParts[1] || stringParts[2]);
}

function isMultipleChoice(string: string) {
    const mcRegex: RegExp = /；；；[^；]*；1；[^；]*；@0 \d+ HA；[^；]*；/;
    return !!string.match(mcRegex);
}

// Returns the prompt from the question string
function getPrompt(string: string) {
    const stringParts = string.split('；');
    const split = stringParts[3].split('，');
    return split[0];
}

// Returns an array of answers from the question string
function getAnswers(string: string) {
    let list = string.split('；');
    let split = list[3].split('，');
    // Get rid of the preceding '—'
    let answers = split[1].substring(1);
    return answers.split('—');
}

// Get's the index of the correct answer from the question string
function getAnswerIndex(string: string) {
    let list = string.split('；');
    let split = list[6].split(' ');
    // The correct answer index, corrected for this frontend
    return Number(split[1]) - 1;
}

// Get's the explanation string from the question string
function getExplanation(string: string) {
    let list = string.split('；');
    return list[7];
}
