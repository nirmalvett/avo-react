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
    Typography,
} from '@material-ui/core';
import {Delete, Done, Lock, LockOpen, Refresh} from '@material-ui/icons';
import * as Http from '../../Http';
import {QuestionSet} from '../../Http/types';
import {ShowSnackBar} from '../../Layout/Layout';
import {HashLoader} from 'react-spinners';
import {AnswerInput} from '../../AnswerInput';
import {FolderIcon} from './FolderIcon';
import {DatePicker} from './DatePicker';
import {Content} from '../../HelperFunctions/Content';
const moment = require('moment');

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
    openTime: Date;
    closeTime: Date;
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
            openTime: moment()
                .set({hour: 0, minute: 0})
                .toDate(),
            closeTime: moment()
                .set({hour: 23, minute: 55})
                .add(1, 'weeks')
                .toDate(),
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
                <Content variant='subtitle1'>{question.prompt}</Content>
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
                <Typography>What should the title of the test be?</Typography>
                <TextField
                    margin='normal'
                    style={{width: '32ch', margin: '2%'}}
                    onChange={e => this.setState({name: e.target.value})}
                />
                <Typography>What should the time limit be?</Typography>
                <TextField
                    margin='normal'
                    placeholder='∞'
                    style={{width: '32ch', margin: '2%'}}
                    onChange={e => this.setState({timeLimit: e.target.value})}
                />
                <Typography>How many attempts should students have?</Typography>
                <TextField
                    margin='normal'
                    placeholder='∞'
                    style={{width: '32ch', margin: '2%'}}
                    onChange={e => this.setState({attempts: e.target.value})}
                />
                <Typography>When should the test be available to students?</Typography>
                <DatePicker time={this.state.openTime} onChange={this.setOpenTime} />
                <Typography>When should the test stop being available to students?</Typography>
                <DatePicker time={this.state.closeTime} onChange={this.setCloseTime} />
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
        Http.saveTest(
            this.props.classID,
            s.name,
            Number(s.openTime),
            Number(s.closeTime),
            Number(s.timeLimit) || -1,
            Number(s.attempts) || -1,
            s.testQuestions.map(x => x.id),
            s.testQuestions.map(x => (x.locked ? x.seed : -1)),
            this.props.onCreate,
            alert,
        );
    };
}
