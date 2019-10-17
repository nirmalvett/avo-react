import React, {Component} from 'react';
import {
    Card,
    CardHeader,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
} from '@material-ui/core';
import {Delete, Done, Lock, LockOpen, Refresh} from '@material-ui/icons';
import * as Http from '../../Http';
import {QuestionSet} from '../../Http/types';
import {ShowSnackBar} from '../../Layout/Layout';
import {HashLoader} from 'react-spinners';
import {getMathJax} from '../../HelperFunctions/Utilities';
import {AnswerInput} from '../../AnswerInput';
import {FolderIcon} from './FolderIcon';
import {DatePicker} from './DatePicker';

interface CreateTestProps {
    showSnackBar: ShowSnackBar;
    onCreate: () => void;
    classID: number;
}

interface CreateTestState {
    sets: (QuestionSet & {open: boolean})[];
    testQuestions: TestQuestion[];
    isLoading: boolean;
    name: string;
    attempts: string;
    timeLimit: string;
    openTime: Date | null;
    closeTime: Date | null;
}

interface TestQuestion {
    id: number;
    name: string;
    seed: number;
    locked: boolean;
    prompt: string;
    prompts: string[];
    types: string[];
}

export default class CreateTest extends Component<CreateTestProps, CreateTestState> {
    constructor(props: CreateTestProps) {
        super(props);
        this.state = {
            sets: [],
            testQuestions: [],
            isLoading: true,
            name: '',
            attempts: '',
            timeLimit: '',
            openTime: null,
            closeTime: null,
        };
    }

    componentDidMount() {
        Http.getSets(this.loadSets, this.errorLoadingSets);
    }

    loadSets = (sets: Http.GetSets) => {
        this.setState({isLoading: false, sets: sets.sets.map(x => ({...x, open: false}))});
    };

    errorLoadingSets = () => {
        this.props.showSnackBar('error', "The question sets couldn't be loaded", 10000);
    };

    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'row', flex: 1}}>
                <div style={{flex: 1, display: 'flex'}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex'}}>
                        {this.renderSidebar()}
                    </Paper>
                </div>
                <div
                    style={{
                        flex: 2,
                        paddingLeft: '10%',
                        paddingRight: '10%',
                        paddingTop: '20px',
                        paddingBottom: '20px',
                        overflowY: 'auto',
                    }}
                >
                    {this.state.testQuestions.map(this.questionCard)}
                    {this.renderTestSettingsCard()}
                </div>
            </div>
        );
    }

    renderSidebar() {
        if (this.state.isLoading) {
            return (
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <HashLoader size={150} color={'#399103'} />
                </div>
            );
        } else {
            return (
                <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                    {this.sidebarQuestionSets()}
                </List>
            );
        }
    }

    sidebarQuestionSets() {
        /* Method is mapping question sets */
        const {sets} = this.state;
        return sets.map((set, sIndex) => (
            <div>
                <ListItem
                    key={'CreateTest-Set-List-Item' + sIndex}
                    button
                    onClick={() => this.toggleFolder(sIndex)}
                    disabled={set.questions.length === 0}
                >
                    <ListItemIcon>
                        <FolderIcon open={set.open} disabled={set.questions.length === 0} />
                    </ListItemIcon>
                    <ListItemText primary={set.name} />
                </ListItem>
                <Collapse in={set.open} timeout='auto' unmountOnExit>
                    <List>
                        {set.questions.map((question, qIndex) => (
                            <ListItem
                                key={'CreateTest-Per-Set' + sIndex + '-' + qIndex}
                                button
                                onClick={() => this.addQuestion(question)}
                            >
                                <ListItemText secondary={question.name} />
                            </ListItem>
                        ))}
                    </List>
                </Collapse>
            </div>
        ));
    }

    toggleFolder(index: number) {
        const sets = [...this.state.sets];
        sets[index] = {...sets[index], open: !sets[index].open};
        this.setState({sets});
    }

    questionCard = (question: TestQuestion, qIndex: number) => {
        const {testQuestions} = this.state;
        const totalQuestions = testQuestions.length;
        return (
            <Card
                key={`Create-Test-Question-Card:${qIndex}-id:${question.id}-seed:${question.seed}`}
                style={{marginTop: '5%', marginBottom: '5%', padding: '10px'}}
            >
                <CardHeader
                    title={question.name}
                    subheader={'Question ' + (qIndex + 1) + '/' + totalQuestions}
                    action={
                        <div>
                            <IconButton onClick={() => this.refresh(qIndex)}>
                                <Refresh />
                            </IconButton>
                            <IconButton onClick={() => this.lock(qIndex)}>
                                {question.locked ? <Lock /> : <LockOpen />}
                            </IconButton>
                            <IconButton onClick={() => this.deleteQuestion(qIndex)}>
                                <Delete />
                            </IconButton>
                        </div>
                    }
                />
                {getMathJax(question.prompt, 'subtitle1')}
                {question.prompts.map((prompt, pIndex) => (
                    <AnswerInput
                        key={`Create-Test-Answer-index:${qIndex}-${pIndex}`}
                        value=''
                        disabled
                        prompt={prompt}
                        type={question.types[pIndex]}
                    />
                ))}
            </Card>
        );
    };

    renderTestSettingsCard() {
        return (
            <Card
                style={{
                    marginTop: '5%',
                    marginBottom: '5%',
                    padding: '10px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <CardHeader
                    title={'Test Settings'}
                    action={
                        <IconButton
                            color='primary'
                            disabled={!this.enableSubmitButton()}
                            onClick={this.saveTest}
                        >
                            <Done />
                        </IconButton>
                    }
                />
                <TextField
                    margin='normal'
                    label='Name'
                    style={{width: '32ch', margin: '2%'}}
                    onChange={e => this.setState({name: e.target.value})}
                />
                <TextField
                    margin='normal'
                    label='Time Limit'
                    style={{width: '32ch', margin: '2%'}}
                    onChange={e => this.setState({timeLimit: e.target.value})}
                />
                <TextField
                    margin='normal'
                    label='Attempts'
                    style={{width: '32ch', margin: '2%'}}
                    onChange={e => this.setState({attempts: e.target.value})}
                />
                <DatePicker
                    time={this.state.openTime}
                    label1='Auto open test'
                    label2='When to automatically open'
                    showHide={(openTime: Date | null) => this.setState({openTime})}
                    onChange={this.setOpenTime}
                />
                <DatePicker
                    time={this.state.closeTime}
                    label1='Auto close test'
                    label2='When to automatically close'
                    showHide={(closeTime: Date | null) => this.setState({closeTime})}
                    onChange={this.setCloseTime}
                />
            </Card>
        );
    }

    setOpenTime = (openTime: Date) => this.setState({openTime});

    setCloseTime = (closeTime: Date) => this.setState({closeTime});

    addQuestion(question: {questionID: number; name: string}) {
        const seed = Math.floor(Math.random() * 65536);
        Http.getQuestion(
            question.questionID,
            seed,
            result => {
                const newQuestion = {
                    id: question.questionID,
                    name: question.name,
                    seed,
                    locked: false,
                    prompt: result.prompt,
                    prompts: result.prompts,
                    types: result.types,
                };
                this.setState({testQuestions: [...this.state.testQuestions, newQuestion]});
            },
            () => this.props.showSnackBar('error', "Question couldn't be generated", 2000),
        );
    }

    refresh(index: number) {
        const q = this.state.testQuestions[index];
        const seed = Math.floor(Math.random() * 65536);
        Http.getQuestion(
            q.id,
            seed,
            result => {
                const newQuestion = {
                    id: q.id,
                    name: q.name,
                    seed,
                    locked: false,
                    prompt: result.prompt,
                    prompts: result.prompts,
                    types: result.types,
                };
                const testQuestions = [...this.state.testQuestions];
                testQuestions[index] = newQuestion;
                this.setState({testQuestions});
            },
            () => this.props.showSnackBar('error', "Question couldn't be generated", 2000),
        );
    }

    lock(index: number) {
        const testQuestions = [...this.state.testQuestions];
        const q = testQuestions[index];
        testQuestions[index] = {...q, locked: !q.locked};
        this.setState({testQuestions});
    }

    deleteQuestion(index: number) {
        const testQuestions = [...this.state.testQuestions];
        testQuestions.splice(index, 1);
        this.setState({testQuestions});
    }

    enableSubmitButton() {
        const {attempts, name, testQuestions, timeLimit} = this.state;
        return (
            name !== '' &&
            testQuestions.length > 0 &&
            /^\d*$/.test(timeLimit) &&
            /^\d*$/.test(attempts)
        );
    }

    saveTest = () => {
        const s = this.state;
        const _200_years = 1000 * 60 * 60 * 24 * 365 * 200;

        const questions = s.testQuestions.map(x => x.id);
        // If a question is not locked, its seed should be -1
        const seeds = s.testQuestions.map(x => (x.locked ? x.seed : -1));
        // If there is no open time then it should be set to the current time
        const openTime = s.openTime ? Number(s.openTime) : Number(new Date());
        // If there is no close time then it should be set to a long time in the future
        const closeTime = s.closeTime ? Number(s.closeTime) : Number(new Date()) + _200_years;
        // If there is no time limit then it should be -1
        const timer = Number(s.timeLimit) || -1;
        // If there is no attempts limit then it should be -1
        const attempts = Number(s.attempts) || -1;

        Http.saveTest(
            this.props.classID,
            s.name,
            openTime,
            closeTime,
            timer,
            attempts,
            questions,
            seeds,
            this.props.onCreate,
            alert,
        );
    };
}
