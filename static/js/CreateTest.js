import React from 'react';
import Http from './Http';
import {copy, getMathJax} from './Utilities';
import { InlineDateTimePicker } from 'material-ui-pickers';
import AnswerInput from './AVOAnswerInput/AnswerInput';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import List from '@material-ui/core/List/List';
import Paper from '@material-ui/core/Paper/Paper';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ListItem from '@material-ui/core/ListItem/ListItem';
import TextField from '@material-ui/core/TextField/TextField';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Done from '@material-ui/icons/Done';
import Lock from '@material-ui/icons/Lock';
import Delete from '@material-ui/icons/Delete';
import Folder from '@material-ui/icons/Folder';
import Refresh from '@material-ui/icons/Refresh';
import LockOpen from '@material-ui/icons/LockOpen';
import FolderOpen from '@material-ui/icons/FolderOpen';


export default class CreateTest extends React.Component {
    constructor(props) {
        super(props);
        Http.getSets((result) => this.setState(result));
        this.state = {
            sets: [],
            testQuestions: [],
            deadline: '2018-01-01T00:00:00.000Z',
            _deadline: new Date(),
            name: null,
            timeLimit: null,
            attempts: null,
        };
    }

    render() {
        let {sets, testQuestions, deadline} = this.state;
        let disableSubmit = testQuestions.length === 0 || deadline.length !== 16;
        return (
            <Grid container spacing={8} style={{flex: 1, display: 'flex'}}>
                <Grid item xs={3} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex'}}>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                            {sets.map((set, setIndex) =>
                                <div>
                                    <ListItem key={"CreateTest" + setIndex} button onClick={() => this.open(setIndex)}
                                              disabled={sets[setIndex].questions.length === 0}>
                                        {set.open
                                            ? <FolderOpen color={set.questions.length === 0 ? 'disabled' : 'action'}/>
                                            : <Folder color={set.questions.length === 0 ? 'disabled' : 'action'}/>
                                        }
                                        <ListItemText inset primary={set.name}/>
                                    </ListItem>
                                    <Collapse in={set.open} timeout='auto' unmountOnExit><List>{
                                        set.questions.map((question, questionIndex) =>
                                            <ListItem key={"CreateTest" + setIndex + "-" + questionIndex}
                                                      button onClick={() => this.addQuestion(question)}>
                                                <ListItemText secondary={question.name}/>
                                            </ListItem>)
                                    }</List></Collapse>
                                </div>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={1}/>
                <Grid item xs={7} style={{marginTop: '20px', marginBottom: '20px', overflowY: 'auto'}}>
                    {this.state.testQuestions.map((question, questionIndex) =>
                        <Card key={`Create-Test-Card-index:${questionIndex}-id:${question.id}-seed:${question.seed}`}
                              style={{marginTop: '5%', marginBottom: '5%', padding: '10px'}}>
                            <CardHeader
                                title={question.name}
                                subheader={'Question ' + (questionIndex + 1) + '/' + testQuestions.length}
                                action={<div>
                                    <IconButton onClick={() => this.refresh(questionIndex)}>
                                        <Refresh/>
                                    </IconButton>
                                    <IconButton onClick={() => this.lock(questionIndex)}>
                                        {question.locked ? <Lock/> : <LockOpen/>}
                                    </IconButton>
                                    <IconButton onClick={() => this.deleteQ(questionIndex)}>
                                        <Delete/>
                                    </IconButton>
                                </div>}
                            />
                            {getMathJax(question.prompt, 'subheading')}
                            {question.prompts.map((a, b) => <AnswerInput key = { `Create-Test-Answer-index:${b}-id:${question.id}-seed:${question.seed}` } value='' disabled prompt={a} type={question.types[b]}/>)}
                        </Card>
                    )}
                    <Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
                        <CardHeader title={'Test Settings'} action={<IconButton disabled={this.state.testQuestions.length === 0} onClick={() => {
                            let s = this.state;
                            let questions = s.testQuestions.map(x => x.id);
                            let seeds = s.testQuestions.map(x => x.locked ? x.seed : -1);
                            let deadline = s.deadline.replace(/[\-T:]/g, '');
                            if (deadline.length !== 12) {
                                alert('Invalid deadline');
                                return;
                            }
                            if(this.state.testQuestions.length == 0) {
                                alert('Test must contain 1 or more questions!');
                                return;
                            }
                            Http.saveTest(this.props.classID, s.name, deadline, s.timeLimit, s.attempts,
                                questions, seeds, () => {this.props.onCreate()},
                                () => {alert('Something went wrong')});
                        }} color='primary'><Done/></IconButton>}/>
                        <TextField margin='normal' label='Name' style={{width: '46%', margin: '2%'}}
                                   onChange={e => this.setState({name: e.target.value})}/>
                        <TextField margin='normal' label='Time Limit in Minutes (-1 for unlimited)' type='number'
                                   style={{width: '46%', margin: '2%'}}
                                   onChange={e => this.setState({timeLimit: e.target.value})}/>
                        <br/>
                        <TextField margin='normal' label='Attempts (-1 for unlimited)' type='number'
                                   style={{width: '46%', margin: '2%'}}
                                   onChange={e => this.setState({attempts: e.target.value})}/>
                        <InlineDateTimePicker
                            margin='normal'
                            style={{width: '46%', margin: '2%'}}
                            label="Deadline"
                            value={this.state._deadline}
                            onChange={this.handleDateChange.bind(this)}
                        />
                    </Card>
                </Grid>
                <Grid item xs={1}/>
            </Grid>
        );
    }

    handleDateChange(date) {
        var d = new Date(date);
        let _date = ("00" + (d.getMonth() + 1)).slice(-2) + "" + 
        ("00" + d.getDate()).slice(-2) + "" + 
        ("00" + d.getHours()).slice(-2) + "" + 
        ("00" + d.getMinutes()).slice(-2) + "";
        _date = d.getFullYear() + "" + _date;
        console.log(_date);
        this.setState({ deadline: _date, _deadline: date });
    };
    open(y) {
        let newSetList = copy(this.state.sets);
        newSetList[y].open = !newSetList[y].open;
        this.setState({sets: newSetList});
    }

    addQuestion(a) {
        let seed = Math.floor(Math.random() * 65536);
        Http.getQuestion(a.id, seed, (result) => {
            let newTestQuestions = copy(this.state.testQuestions);
            newTestQuestions.push({id: a.id, name: a.name, seed: seed,
                locked: false, prompt: result.prompt, prompts: result.prompts, types: result.types});
            this.setState({testQuestions: newTestQuestions});
        }, () => {});
    }

    refresh(index) {
        let seed = Math.floor(Math.random() * 65536);
        Http.getQuestion(this.state.testQuestions[index].id, seed, (result) => {
            let newTestQuestions = copy(this.state.testQuestions);
            newTestQuestions[index].prompt = result.prompt;
            newTestQuestions[index].prompts = result.prompts;
            newTestQuestions[index].seed = seed;
            this.setState({testQuestions: newTestQuestions});
        }, () => {});
    }

    lock(index) {
        let newTestQuestions = copy(this.state.testQuestions);
        newTestQuestions[index].locked = !newTestQuestions[index].locked;
        this.setState({testQuestions: newTestQuestions});
    }

    deleteQ(index) {
        let newTestQuestions = copy(this.state.testQuestions);
        newTestQuestions.splice(index, 1);
        this.setState({testQuestions: newTestQuestions});
    };

    saveTest() {
        let s = this.state;
        console.log(s.deadline);
        let questions = s.testQuestions.map(x => x.id);
        let seeds = s.testQuestions.map(x => x.locked ? x.seed : -1);
        let deadline = s.deadline.replace(/[\-T:]/g, '');
        Http.saveTest(this.props.classID, s.name, deadline, s.timeLimit, s.attempts, questions, seeds,
            () => {this.props.onCreate()},
            () => {alert('Something went wrong')}
        );
    }
}