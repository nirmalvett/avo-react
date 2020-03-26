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
import FormControl from '@material-ui/core/FormControl';
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
} from '@material-ui/icons/';
import {
    ListItem,
    ListItemText,
    ListItemIcon,
    Popover,
    List,
    InputLabel,
    MenuItem,
    Select,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Question, QuestionSet, Course, WordInputConfigCorrectAnswer} from 'Http/types';
import {ShowSnackBar} from 'Layout/Layout';
import WordInput from '../QuestionBuilder/WordInput'

export interface WordInputQuestionBuilderProps {
    showSnackBar: ShowSnackBar;
    sets: QuestionSet[];
    courses: Course[];
    updateSets: (questionSets: QuestionSet[], cb?: () => void) => void;
    returnHome: () => void;
}

interface WordInputQuestionBuilderState {
    loaded: boolean;
    questionID: number;
    questionName: string;
    questionNmeE: boolean;
    questionText: string;
    questionTxtE: boolean;
    questionAnsr: string;
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
    importerOpen: boolean;
    questionAnsrE: boolean;
    questionSelectableString: string;
    questionSelectableStringE: boolean;
    wordInputMode: 'word' | 'sentence';
}

export default class WordInputQuestionBuilder extends Component<WordInputQuestionBuilderProps,
    WordInputQuestionBuilderState> {
    constructor(props: WordInputQuestionBuilderProps) {
        super(props);
        this.state = {
            loaded: false, // Checks if the page has had all required data loaded
            questionID: -1, // Only used in edit mode to edit the question
            questionName: '', // Stores the question Name string
            questionNmeE: true, // Keeps track of whether or not we're editing the question name
            questionText: '', // Stores the questions Prompt string
            questionTxtE: true, // Keeps track of if we're editing the prompt
            questionAnsr: '', // Stores whether the answer is true or false
            questionExpl: '', // Stores the question Explanation String
            questionExpE: true, // Keeps track of if we're editing the explanation string
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
            toEdit: null,
            hovered: -1, // The ID of the current question being hovered
            course: -1,
            setName: '',
            importerOpen: false, // Determines whether we are showing the question importer
            questionAnsrE: true,
            questionSelectableString: '',
            questionSelectableStringE: true,
            wordInputMode: 'word',
        };
    }

    render() {
        const editor = document.getElementById('to-select-from-input');
        if (editor)
            editor.addEventListener("paste", (e: any) => {
                // cancel paste
                e.preventDefault();

                // get text representation of clipboard
                var text = e.clipboardData.getData('text/plain');
                // insert text manually
                document.execCommand("insertHTML", false, text);
            });
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
                                        <ArrowBack/>
                                    </IconButton>
                                </ListItemIcon>
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
                                        <CreateNewFolder/>
                                    </IconButton>
                                )}
                            </ListItem>
                            <Divider/>
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
                                height: 'calc(100vh - 125px)',
                                width: 'auto',
                                maxHeight: '100%',
                                overflow: 'auto'
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
                                        <SaveIcon fontSize='inherit'/>
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
                                            <EditIcon fontSize='inherit'/>
                                        </IconButton>
                                    </span>
                                </span>
                            )}
                            <br/>
                            <br/>
                            {this.state.questionTxtE ? (
                                <span>
                                    <TextField
                                        id='outlined-name'
                                        label='Question Prompt'
                                        multiline
                                        rows='10'
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
                                        <SaveIcon fontSize='inherit'/>
                                    </IconButton>
                                </span>
                            ) : (
                                <span>
                                    <div>
                                        <Typography variant='body2' gutterBottom>
                                            {this.state.questionText.split('\n').map(word => <div>
                                                <br/>
                                                <br/>
                                                {`${word}`}
                                            </div>)}
                                        </Typography>
                                    </div>
                                    <span>
                                        <IconButton
                                            aria-label='edit'
                                            size='small'
                                            onClick={() => this.setState({questionTxtE: true})}
                                        >
                                            <EditIcon fontSize='inherit'/>
                                        </IconButton>
                                    </span>
                                </span>
                            )}
                            <br/>
                            <br/>
                            {this.state.questionSelectableStringE ? (
                                <span>
                                    <TextField
                                        id='to-select-from-input'
                                        label='Phrase to select answer'
                                        multiline
                                        rows='10'
                                        margin='normal'
                                        variant='outlined'
                                        style={{
                                            width: '90%',
                                        }}
                                        value={this.state.questionSelectableString}
                                        onChange={e =>
                                            this.setState({
                                                changed: true,
                                                questionSelectableString: e.target.value,
                                                questionAnsr: '',
                                            }) // toggling so the saved answer clears
                                        }
                                    />
                                    <IconButton
                                        aria-label='save'
                                        size='small'
                                        onClick={() =>
                                            this.setState({questionSelectableStringE: false})
                                        }
                                    >
                                        <SaveIcon fontSize='inherit'/>
                                    </IconButton>
                                </span>
                            ) : (
                                <div>
                                    <div style={{float: 'left'}}>
                                        <Typography variant='body2' gutterBottom>
                                            {this.state.questionSelectableString.split('\n').map(word => <div>
                                                <br/>
                                                <br/>
                                                {`${word}`}
                                            </div>)}
                                        </Typography>
                                    </div>
                                    <span>
                                        <IconButton
                                            aria-label='edit'
                                            size='small'
                                            onClick={() =>
                                                this.setState({questionSelectableStringE: true})
                                            }
                                        >
                                            <EditIcon fontSize='inherit'/>
                                        </IconButton>
                                    </span>
                                </div>
                            )}
                            <br/>
                            <br/>
                            {this.state.questionAnsrE ? (
                                <span>
                                    <WordInput
                                        key={'wordinput1'}
                                        onChange={value =>
                                            this.setState({
                                                changed: true,
                                                questionAnsr: value,
                                                questionExpE: !this.state.questionExpE
                                            }, () => this.setState({questionExpE: !this.state.questionExpE})) // toggling so the saved explanation updates
                                        }
                                        color={{200: 'green', 500: 'green'}}
                                        value={this.state.questionAnsr}
                                        mode={this.state.wordInputMode}
                                    >
                                        {this.state.questionSelectableString}
                                    </WordInput>
                                    <Button
                                        onClick={() => {
                                            this.setState({
                                                questionAnsr: '',
                                                wordInputMode:
                                                    this.state.wordInputMode === 'word'
                                                        ? 'sentence'
                                                        : 'word',
                                            });
                                        }}
                                        color='primary'
                                        variant='contained'
                                        autoFocus
                                    >
                                        Switch to{' '}
                                        {this.state.wordInputMode === 'word' ? 'sentence' : 'word'}{' '}
                                        mode
                                    </Button>
                                    <IconButton
                                        aria-label='save'
                                        size='small'
                                        onClick={() => this.setState({questionAnsrE: false})}
                                    >
                                        <SaveIcon fontSize='inherit'/>
                                    </IconButton>
                                </span>
                            ) : (
                                <span>
                                    <span style={{float: 'left'}}>
                                        <WordInput
                                            key={'wordinput2'}
                                            onChange={value => {
                                            }}
                                            color={{200: 'green', 500: 'green'}}
                                            value={this.state.questionAnsr}
                                            mode={this.state.wordInputMode}
                                            disabled={true}
                                        >
                                            {this.state.questionSelectableString}
                                        </WordInput>
                                    </span>
                                    <span>
                                        <IconButton
                                            aria-label='edit'
                                            size='small'
                                            onClick={() => this.setState({questionAnsrE: true})}
                                        >
                                            <EditIcon fontSize='inherit'/>
                                        </IconButton>
                                    </span>
                                </span>
                            )}
                            <br/>
                            <br/>
                            <br/>
                            <br/>
                            {this.state.questionExpE ? (
                                <span>
                                    <TextField
                                        id='outlined-name'
                                        label={`Explanation for the answer...`}
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
                                        <SaveIcon fontSize='inherit'/>
                                    </IconButton>
                                </span>
                            ) : (
                                <span>
                                    <span style={{float: 'left'}}>
                                        <Typography variant='body2' gutterBottom>
                                            {this.state.questionExpl}
                                        </Typography>
                                        <WordInput
                                            key={'wordinput3'}
                                            onChange={value => {
                                            }}
                                            color={{200: 'green', 500: 'green'}}
                                            value={this.state.questionAnsr}
                                            mode={this.state.wordInputMode}
                                            disabled={true}
                                        >
                                            {this.state.questionSelectableString}
                                        </WordInput>
                                    </span>
                                    <span>
                                        <IconButton
                                            aria-label='edit'
                                            size='small'
                                            onClick={() => this.setState({questionExpE: true})}
                                        >
                                            <EditIcon fontSize='inherit'/>
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
                            <SaveIcon/>
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
                                this.loadQuestion();
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
                        <Folder color={selectedS === index ? 'primary' : 'action'}/>
                    ) : (
                        <Lock color={selectedS === index ? 'primary' : 'action'}/>
                    )}
                </ListItemIcon>
                <ListItemText primary={set.name}/>
                {index === this.state.hovered && (
                    <IconButton
                        size='small'
                        edge='end'
                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                            this.deleteSet(index, event)
                        }
                    >
                        <DeleteIcon/>
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
                    disabled={!isWordInput(question)}
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
                    <ListItemText secondary={question.name}/>
                    {hovered === question.questionID && (
                        <IconButton
                            size='small'
                            edge='end'
                            onClick={() => this.switchQuestion(index)}
                        >
                            <EditIcon/>
                        </IconButton>
                    )}
                    {hovered === question.questionID && (
                        <IconButton
                            size='small'
                            edge='end'
                            onClick={() => this.setState({deleteDiagOpen: true, toEdit: index})}
                        >
                            <DeleteIcon/>
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
        if (this.state.questionSelectableStringE) {
            list.push(
                <li>
                    <Typography>Save the text you select the answer from</Typography>
                </li>,
            );
        }
        if (this.state.questionAnsr === '')
            list.push(
                <li>
                    <Typography>Please select an answer</Typography>
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

    selectSet = (set: QuestionSet, index: number) => {
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


    handleSaveMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!this.isValid()) {
            this.setState({popopen: true, anchorEl: event.currentTarget});
        }
    };

    submitQuestion = () => {
        if (this.state.editMode) {
            Http.renameQuestion(
                this.state.questionID,
                this.state.questionName,
                () =>
                    Http.editQuestion(
                        this.state.questionID,
                        this.state.questionText,
                        1,
                        1,
                        () => this.postSuccess(),
                        () => this.props.showSnackBar('error', 'Error editing question', 2000),
                        {
                            'type': 'word input',
                            'explanation': `${this.state.questionExpl}\n${this.constructAnswerForExplanation()}`,
                            'correct_answer': this.state.questionAnsr.split('~~').map(answer => Number.parseInt(answer)),
                            'types': [this.state.wordInputMode === 'word' ? '10' : '11'],
                            'prompts': [this.state.questionSelectableString],
                        }
                    ),
                () => this.props.showSnackBar('error', 'Error editing question', 2000),
            );
        } else {
            Http.newQuestion(
                this.props.sets[this.state.selectedS as number].setID,
                this.state.questionName,
                this.state.questionText,
                1,
                1,
                () => this.postSuccess(),
                () => this.props.showSnackBar('error', 'Error creating question', 2000),
                {
                    'type': 'word input',
                    'explanation': `${this.state.questionExpl}\n${this.constructAnswerForExplanation()}`,
                    'correct_answer': this.state.questionAnsr.split('~~').map(answer => Number.parseInt(answer)),
                    'types': [this.state.wordInputMode === 'word' ? '10' : '11'],
                    'prompts': [this.state.questionSelectableString],
                }
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
            question.string = this.state.questionText;
            question.config = {
                'type': 'word input',
                'explanation': `${this.state.questionExpl}\n${this.constructAnswerForExplanation()}`,
                'correct_answer': this.state.questionAnsr.split('~~').map(answer => Number.parseInt(answer)),
                'types': [this.state.wordInputMode === 'word' ? '10' : '11'],
                'prompts': [this.state.questionSelectableString],
            };
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
        let updated = sets.slice();
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
        if (!index) question = sets[selectedS as number].questions[toEdit as number];
        // Used when immediately switching to the next question
        else question = sets[selectedS as number].questions[index];

        if (isWordInput(question)) {
            this.setState({
                questionID: question.questionID,
                questionName: question.name,
                questionNmeE: false,
                questionText: question.string,
                questionTxtE: false,
                questionAnsr: (question.config.correct_answer as WordInputConfigCorrectAnswer)
                    .map(q => String(q))
                    .join('~~'),
                questionExpE: false,
                editMode: true,
                changed: false,
                questionSelectableStringE: false,
                questionAnsrE: false,
                questionSelectableString: question.config.prompts[0],
                wordInputMode: question.config.types[0] === '10' ? 'word' : 'sentence'
            }, () => this.setState({questionExpl: question.config.explanation.replace(`\n${this.constructAnswerForExplanation()}`, '')}));
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
            questionAnsr: '',
            questionExpl: '',
            questionExpE: true,
            editMode: false,
            changed: false,
            questionAnsrE: true,
            questionSelectableString: '',
            questionSelectableStringE: true,
            wordInputMode: 'word',
        });
    };

    isValid = () => {
        return (
            this.state.loaded &&
            !!this.state.questionName &&
            this.state.setQActive &&
            !this.state.questionNmeE &&
            !this.state.questionTxtE &&
            !this.state.questionExpE &&
            !this.state.questionSelectableStringE &&
            this.state.questionAnsr !== ''
        );
    };

    closeAddSetDialog = () => {
        this.setState({addDiagOpen: false, setName: '', course: -1});
    };

    closeImporter = (refresh: boolean) => {
        this.setState({importerOpen: false});
        console.log('refresh: ' + refresh);
        // Refresh the set if new questions have been addded
        if (refresh) {
            console.log('Refreshing');
        }
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

    constructAnswerForExplanation = () => {
        const selector = this.state.wordInputMode === 'word' ? '<wordinput>' : '<sentenceinput>';
        const {questionAnsr, questionSelectableString} = this.state;
        return `The answer is...\n${selector}${questionSelectableString}~~${questionAnsr}${selector}`;
    };
}

function isWordInput(question: Question): boolean {
    return Boolean(question.config && question.config.type && question.config.type == 'word input');
}
