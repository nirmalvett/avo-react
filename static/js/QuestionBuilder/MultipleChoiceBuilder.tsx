import React, {Component} from 'react';
import * as Http from '../Http';
import {
    Add as AddIcon,
    ArrowBack,
    Check as CheckIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Folder,
    InsertDriveFile as QuestionIcon,
    Lock,
    Save as SaveIcon,
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
} from '@material-ui/core';
import {AvoSet, AvoQuestion} from '../Http/types';
import {ShowSnackBar} from '../Layout/Layout';

export interface MultipleChoiceBuilderProps {
    showSnackBar: ShowSnackBar;
    sets: AvoSet[];
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
    sets: AvoSet[];
    setsActive: boolean;
    setQActive: boolean;
    selectedS: null | number;
    selectedQ: null | number;
    selectedSName: string;
    popopen: boolean;
    anchorEl: null;
    switchDiagOpen: boolean;
    deleteDiagOpen: boolean;
    editMode: boolean;
    changed: boolean;
    nextQuestion: null | AvoQuestion;
    hovered: number;
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
            sets: this.props.sets,
            setsActive: false,
            setQActive: false,
            selectedS: null,
            selectedQ: null,
            selectedSName: '',
            popopen: false,
            anchorEl: null,
            switchDiagOpen: false,
            deleteDiagOpen: false,
            editMode: false,
            changed: false,
            nextQuestion: null, // Used to store a selected question that hasn't been loaded
            hovered: -1, // The ID of the current question being hovered
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
                            {this.state.setsActive && (
                                <IconButton
                                    aria-label='go back'
                                    size='small'
                                    style={{marginLeft: '16px'}}
                                    onClick={this.props.returnHome}
                                >
                                    <ArrowBack />
                                </IconButton>
                            )}
                            {this.state.setQActive && (
                                <IconButton
                                    aria-label='go back'
                                    size='small'
                                    style={{marginLeft: '16px'}}
                                    onClick={() => this.goBackToSets()}
                                >
                                    <ArrowBack onClick={() => this.setState({selectedQ: null})} />
                                </IconButton>
                            )}
                            <Typography
                                variant='subtitle1'
                                gutterBottom
                                style={{
                                    marginLeft: '16px',
                                    padding: '3px',
                                    display: 'inline-block',
                                }}
                            >
                                {this.state.setQActive ? this.state.selectedSName : 'Question Sets'}
                            </Typography>
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
                                        <Typography variant='subtitle1' gutterBottom>
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
                                <RadioGroup aria-label='multiple choice input' name='choices'>
                                    {this.state.questionOpts.map((string, index) => {
                                        return (
                                            <FormControlLabel
                                                value={string}
                                                disabled
                                                control={<Radio />}
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
                                                                <IconButton
                                                                    aria-label='set as correct Answer'
                                                                    size='small'
                                                                    onClick={() => {
                                                                        this.setState({
                                                                            questionAnsr: index,
                                                                        });
                                                                    }}
                                                                >
                                                                    {this.state.questionAnsr ===
                                                                    index ? (
                                                                        <CheckIcon fontSize='inherit' />
                                                                    ) : (
                                                                        <CloseIcon fontSize='inherit' />
                                                                    )}
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
                        onMouseEnter={event => this.handleSaveMouseEnter(event)}
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
                                if (this.state.nextQuestion) {
                                    this.loadQuestion(this.state.nextQuestion);
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
                                if (this.state.nextQuestion != null)
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
            </Grid>
        );
    }

    renderSetList = () => {
        let {selectedS} = this.state;
        return this.state.sets.map((set, index) => (
            <ListItem key={set.id + '-' + index} button onClick={() => this.selectSet(set, index)}>
                <ListItemIcon>
                    {set.can_edit ? (
                        <Folder color={selectedS === index ? 'primary' : 'action'} />
                    ) : (
                        <Lock color={selectedS === index ? 'primary' : 'action'} />
                    )}
                </ListItemIcon>
                <ListItemText primary={set.name} />
            </ListItem>
        ));
    };

    renderQuestionList = () => {
        const {selectedS, sets, questionID, hovered} = this.state;
        if (this.state.selectedS !== null)
            return this.state.sets[this.state.selectedS].questions.map((question, index) => (
                <ListItem
                    disabled={!isMultipleChoice(question.string)}
                    key={question.id + '-' + index}
                    button
                    onClick={() => this.setState({nextQuestion: question})}
                    onMouseEnter={() => this.setState({hovered: question.id})}
                    onMouseLeave={() => this.setState({hovered: -1})}
                >
                    <ListItemIcon>
                        <QuestionIcon color={questionID === question.id ? 'primary' : 'action'} />
                    </ListItemIcon>
                    <ListItemText secondary={question.name} />
                    {hovered === question.id && (
                        <IconButton
                            size='small'
                            edge='end'
                            onClick={() => this.switchQuestion(question)}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                    {hovered === question.id && (
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
        this.setState({loaded: true});
        this.getSets();
    };

    selectSet = (set: {name: string}, index: number) => {
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
            result => this.setState({sets: result.sets, setsActive: true}),
            () => alert('Something went wrong when retrieving your question list'),
        );
    };

    refreshSets = () => {
        Http.getSets(
            result => this.setState({sets: result.sets}),
            () => alert('Something went wrong when retrieving your question list'),
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
                (this.state.selectedS as number) + 1, // Must be +1 for server side
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

    deleteSuccess = (question: AvoQuestion) => {
        this.props.showSnackBar('success', 'Question deleted', 2000);
        if (question.id === this.state.questionID) this.reset();
        else this.refreshSets();
    };

    switchQuestion = (question: AvoQuestion) => {
        if (this.state.changed) {
            this.setState({switchDiagOpen: true});
        } else {
            this.loadQuestion(question);
        }
    };

    loadQuestion = (question: AvoQuestion) => {
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
                questionID: question.id,
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

    deleteQuestion = (question: AvoQuestion) => {
        Http.deleteQuestion(
            question.id,
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
            questionOpts: ['Option 1', 'Option 2', 'Option 3'],
            questionEdit: [false, false, false],
            questionAnsr: 0,
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
            !this.state.questionEdit.includes(true) &&
            !this.state.questionExpE
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
    let mcRegex = /；；；[^；]*；1；[^；]*；@0 \d+ HA；[^；]*；/;
    if (string.match(mcRegex)) return true;
    return false;
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
