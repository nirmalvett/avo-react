import React, { Component } from 'react';
import Http from '../../HelperFunctions/Http';
import { copy, getMathJax } from '../../HelperFunctions/Utilities';
import { InlineDateTimePicker } from 'material-ui-pickers';
import AnswerInput from '../../AnswerInput/AnswerInput';
import { Card, List, Paper, Collapse, ListItem, TextField, CardHeader, IconButton, ListItemText } from '@material-ui/core';
import { Done, Lock, Delete, Folder, Refresh, LockOpen, FolderOpen } from '@material-ui/icons';
import { QuestionSidebar } from "./QuestionSidebar";

export default class CreateTest extends Component {
    constructor(props) {
        super(props);
        Http.getSets((result) => this.setState(result));
        this.state = {
            sets: [],
            testQuestions: [],
            deadline: '2018-01-01T00:00:00.000Z',
            _deadline: new Date(),
            openTime: '2018-01-01T00:00:00.000Z',
            _openTime: new Date(),
            name: null,
            timeLimit: null,
            attempts: null,
        };
    }

    render() {
        let {sets, testQuestions, deadline} = this.state;
        let disableSubmit = testQuestions.length === 0 || deadline.length !== 16;
        return (
            <div style={{display: 'flex', flexDirection: 'row', flex: 1}}>
                { QuestionSidebar(this.open.bind(this), this.addQuestion.bind(this), sets) }
                <div style={{
                    flex: 2,
                    paddingLeft: '10%',
                    paddingRight: '10%',
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    overflowY: 'auto'
                }}>
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
                    { this.bottomSubmissionCard() }

                </div>
            </div>
        );
    }

    handleDateChange(date) {
        var d = new Date(date);
        let _date = ("00" + (d.getMonth() + 1)).slice(-2) + "" +
            ("00" + d.getDate()).slice(-2) + "" +
            ("00" + d.getHours()).slice(-2) + "" +
            ("00" + d.getMinutes()).slice(-2) + "";
        _date = d.getFullYear() + "" + _date;
        this.setState({ deadline: _date, _deadline: date });
    };

    handleOpenChange(date) {
        var d = new Date(date);
        let _date = ("00" + (d.getMonth() + 1)).slice(-2) + "" +
            ("00" + d.getDate()).slice(-2) + "" +
            ("00" + d.getHours()).slice(-2) + "" +
            ("00" + d.getMinutes()).slice(-2) + "";
        _date = d.getFullYear() + "" + _date;
        this.setState({ openTime: _date, _openTime: date });
    };

    bottomSubmissionCard(){
        return (
            <Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
                        <CardHeader title={'Test Settings'} action={this.submitTest()}/>
                        <TextField
                            margin='normal'
                            label='Name'
                            style={{width: '46%', margin: '2%'}}
                            onChange={e => this.setState({name: e.target.value})}
                        />
                        <TextField
                            margin='normal' label='Time Limit in Minutes (-1 for unlimited)' type='number'
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
                        <InlineDateTimePicker
                            margin='normal'
                            style={{width: '46%', margin: '2%'}}
                            label="Test Auto Open Time"
                            value={this.state._openTime}
                            onChange={this.handleOpenChange.bind(this)}
                        />
                    </Card>
        )
    }

    submitTest(){
        return (
            <IconButton disabled={this.state.testQuestions.length === 0} onClick={() => {
                            let s = this.state;
                            let questions = s.testQuestions.map(x => x.id);
                            let seeds = s.testQuestions.map(x => x.locked ? x.seed : -1);
                            let deadline = s.deadline.replace(/[\-T:]/g, '');
                            let openTime = s.openTime.replace(/[\-T:]/g, '');
                            if (deadline.length !== 12) {
                                alert('Invalid deadline');
                                return;
                            }

                            if (openTime.length !== 12){
                                alert('Invalid Auto Open Time');
                                return;
                            }
                            if(this.state.testQuestions.length === 0) {
                                alert('Test must contain 1 or more questions!');
                                return;
                            }
                            Http.saveTest(
                                this.props.classID,
                                s.name,
                                deadline,
                                openTime,
                                s.timeLimit,
                                s.attempts,
                                questions,
                                seeds,
                                () => {this.props.onCreate()},
                                () => {alert('Something went wrong')});
                        }} color='primary'>
                    <Done/>
                </IconButton>
        )
    }

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
