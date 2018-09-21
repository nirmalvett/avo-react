import React from 'react';
import Http from './Http';
import {getMathJax} from './Utilities';
import AnswerInput from './AnswerInput';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import List from '@material-ui/core/List/List';
import Paper from '@material-ui/core/Paper/Paper';
import Checkbox from '@material-ui/core/Checkbox/Checkbox';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ListItem from '@material-ui/core/ListItem/ListItem';
import TextField from '@material-ui/core/TextField/TextField';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
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
            deadline: '',
            isAssignment: false,
        };
    }

    render() {
        let refresh = index => () => {
            let seed = Math.floor(Math.random() * 65536);
            Http.getQuestion(this.state.testQuestions[index].id, seed, (result) => {
                let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
                newTestQuestions[index].prompt = result.prompt;
                newTestQuestions[index].prompts = result.prompts;
                newTestQuestions[index].seed = seed;
                this.setState({testQuestions: newTestQuestions});
            }, () => {});
        };
        let lock = index => () => {
            let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
            newTestQuestions[index].locked = true;
            this.setState({testQuestions: newTestQuestions});
        };
        let unlock = index => () => {
            let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
            newTestQuestions[index].locked = false;
            this.setState({testQuestions: newTestQuestions});
        };
        let deleteQ = index => () => {
            let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
            newTestQuestions.splice(index, 1);
            this.setState({testQuestions: newTestQuestions});
        };
        return (
            <Grid container spacing={8} style={{flex: 1, display: 'flex', marginBottom: 0}}>
                <Grid item xs={3} style={{flex: 1, display: 'flex'}}>
                    <Paper style={{width: '100%', flex: 1, display: 'flex'}}>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}} component='nav'
                              subheader={<ListSubheader component='div'>Question Sets</ListSubheader>}>
                            {this.state.sets.map((x, y) => [
                                <ListItem button onClick={() => {
                                    let newSetList = JSON.parse(JSON.stringify(this.state.sets));
                                    newSetList[y].open = !newSetList[y].open;
                                    this.setState({sets: newSetList});
                                }} disabled={this.state.sets[y].questions.length === 0}>
                                    {x.open ?
                                        <FolderOpen color={x.questions.length === 0 ? 'disabled' : 'action'}/> :
                                        <Folder color={x.questions.length === 0 ? 'disabled' : 'action'}/>}
                                    <ListItemText inset primary={x.name}/>
                                </ListItem>,
                                <Collapse in={x.open} timeout='auto' unmountOnExit><List>{
                                    x.questions.map((a) =>
                                        <ListItem button onClick={() => {
                                            let seed = Math.floor(Math.random() * 65536);
                                            Http.getQuestion(a.id, seed, (result) => {
                                                let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
                                                newTestQuestions.push({id: a.id, name: a.name, seed: seed,
                                                    locked: false, prompt: result.prompt, prompts: result.prompts, types: result.types});
                                                this.setState({testQuestions: newTestQuestions});
                                            }, () => {});
                                        }}>
                                            <ListItemText secondary={a.name}/>
                                        </ListItem>)
                                }</List></Collapse>
                            ])}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={1} style={{textAlign: 'center', marginTop: '10%'}}/>
                <Grid item xs={7} style={{marginTop: '20px', marginBottom: '20px', overflowY: 'auto'}}>
                    {this.state.testQuestions.map((x, y) =>
                        <Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px'}}>
                            <CardHeader
                                title={x.name}
                                subheader={'Question ' + (y + 1) + '/' + this.state.testQuestions.length}
                                action={[
                                    <IconButton onClick={refresh(y)}><Refresh/></IconButton>,
                                    x.locked
                                        ? <IconButton onClick={unlock(y)}><Lock/></IconButton>
                                        : <IconButton onClick={lock(y)}><LockOpen/></IconButton>,
                                    <IconButton onClick={deleteQ(y)}><Delete/></IconButton>]}/>
                            {getMathJax(x.prompt, 'subheading')}
                            {x.prompts.map((a, b) => <AnswerInput value='' disabled prompt={a} type={x.types[b]}/>)}
                        </Card>
                    )}
                    <Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
                        <CardHeader title={'Test Settings'} action={<IconButton onClick={() => {
                            let s = this.state;
                            let questions = s.testQuestions.map(x => x.id);
                            let seeds = s.testQuestions.map(x => x.locked ? x.seed : -1);
                            let deadline = s.deadline.replace(/[\-T:]/g, '');
                            if (deadline.length !== 12) {
                                alert('Invalid deadline');
                                return;
                            }
                            Http.saveTest(this.props.classID, s.name, deadline, s.timeLimit, s.attempts,
                                s.isAssignment, questions, seeds, () => {this.props.onCreate()},
                                () => {alert('Something went wrong')});
                        }} color='primary'><Done/></IconButton>}/>
                        <TextField margin='normal' label='Name' style={{width: '46%', margin: '2%'}}
                                   onChange={e => this.setState({name: e.target.value})}/>
                        <TextField margin='normal' label='Time Limit (minutes)' type='number'
                                   style={{width: '46%', margin: '2%'}}
                                   onChange={e => this.setState({timeLimit: e.target.value})}/>
                        <br/>
                        <TextField margin='normal' label='Attempts (enter -1 for unlimited)' type='number'
                                   style={{width: '46%', margin: '2%'}}
                                   onChange={e => this.setState({attempts: e.target.value})}/>
                        <TextField margin='normal' helperText='Deadline' type='datetime-local'
                                   style={{width: '46%', margin: '2%'}}
                                   onChange={e => this.setState({deadline: e.target.value})}/>
                        <br/>
                        <FormControlLabel style={{width: '46%', margin: '2%'}}
                                          control={<Checkbox checked={this.state.isAssignment}
                                                             onChange={() => this.setState({isAssignment: !this.state.isAssignment})}
                                                             color='primary'/>}
                                          label='This is an assignment'
                        />
                    </Card>
                </Grid>
                <Grid item xs={1} style={{textAlign: 'center', marginTop: '10%'}}/>
            </Grid>
        );
    }
}