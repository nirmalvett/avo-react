import React from 'react';
import Http from './Http';
import MathJax from 'react-mathjax2'
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import List from '@material-ui/core/List/List';
import Paper from '@material-ui/core/Paper/Paper';
import Button from '@material-ui/core/Button/Button';
import Checkbox from '@material-ui/core/Checkbox/Checkbox';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ListItem from '@material-ui/core/ListItem/ListItem';
import TextField from '@material-ui/core/TextField/TextField';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import Done from '@material-ui/icons/Done';
import Lock from '@material-ui/icons/Lock';
import Delete from '@material-ui/icons/Delete';
import Folder from '@material-ui/icons/Folder';
import Refresh from '@material-ui/icons/Refresh';
import LockOpen from '@material-ui/icons/LockOpen';
import ArrowBack from '@material-ui/icons/ArrowBack';
import FolderOpen from '@material-ui/icons/FolderOpen';
import ArrowForward from '@material-ui/icons/ArrowForward';


export default class CreateTest extends React.Component {
    constructor(props) {
        super(props);
        Http.getSets((result) => this.setState(result));
        this.state = {
            sets: [],
            testQuestions: [],
            questionIndex: 0
        };
    }

    render() {
        let getMathJax = (text, variant) => {
            let strings = text.split(/\\[()]/).map((x, y) => y % 2 === 0 ? x :
                <MathJax.Node inline>{x}</MathJax.Node>);
            return <MathJax.Context input='tex'><Typography variant={variant}>{strings}</Typography></MathJax.Context>
        };
        let index = this.state.questionIndex;
        let currentQ = this.state.testQuestions[index];
        let refresh = () => {
            let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
            newTestQuestions[index].seed = Math.floor(Math.random() * 65536);
            this.setState({testQuestions: newTestQuestions});
            let seed = Math.floor(Math.random() * 65536);
            Http.getQuestion(currentQ.id, seed, (result) => {
                let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
                newTestQuestions[index].prompt = result.prompt;
                newTestQuestions[index].prompts = result.prompts;
                this.setState({testQuestions: newTestQuestions});
            }, () => {});
        };
        let lock = () => {
            let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
            newTestQuestions[index].locked = true;
            this.setState({testQuestions: newTestQuestions});
        };
        let unlock = () => {
            let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
            newTestQuestions[index].locked = false;
            this.setState({testQuestions: newTestQuestions});
        };
        let deleteQ = () => {
            let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
            newTestQuestions.splice(index, 1);
            this.setState({
                testQuestions: newTestQuestions,
                questionIndex: index === 0 && newTestQuestions.length !== 0 ? 0 : index - 1
            });
        };
        let disableL = index === 0;
        let disableR = index === this.state.testQuestions.length;
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
                                                let newIndex = disableR ? index : index + 1;
                                                newTestQuestions.splice(newIndex, 0,
                                                    {id: a.id, name: a.name, seed: seed, locked: false,
                                                        prompt: result.prompt, prompts: result.prompts});
                                                this.setState({testQuestions: newTestQuestions, questionIndex: newIndex});
                                            }, () => {});
                                        }}>
                                            <ListItemText secondary={a.name}/>
                                        </ListItem>)
                                }</List></Collapse>
                            ])}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={1} style={{textAlign: 'center', marginTop: '10%'}}>
                    <Button variant='fab' onClick={() => {this.setState({questionIndex: index - 1})}} disabled={disableL}>
                        <ArrowBack style={{width: '100%'}}/></Button></Grid>
                <Grid item xs={7} style={{display: 'flex'}}>
                    <Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>{
                        index === this.state.testQuestions.length
                            ? [<CardHeader title={'Test Settings'}
                                           action={<IconButton><Done/></IconButton>}/>,
                                <TextField margin='normal' label='Name'
                                           style={{width: '46%', margin: '2%'}}/>,
                                <TextField margin='normal' label='Time Limit (minutes)' type='number'
                                           style={{width: '46%', margin: '2%'}}/>,
                                <br/>,
                                <TextField margin='normal' label='Attempts (enter -1 for unlimited)' type='number'
                                           style={{width: '46%', margin: '2%'}}/>,
                                <TextField margin='normal' helperText='Deadline' type='datetime-local'
                                           style={{width: '46%', margin: '2%'}}/>,
                                <br/>,
                                <FormControlLabel style={{width: '46%', margin: '2%'}}
                                    control={<Checkbox checked={this.state.isAssignment}
                                            onChange={() => this.setState({isAssignment: !this.state.isAssignment})}
                                            color='primary'
                                        />
                                    }
                                    label='This is an assignment'
                                />,
                            ]
                            : [<CardHeader
                                title={currentQ.name}
                                subheader={'Question ' + (index + 1) + '/' + this.state.testQuestions.length}
                                action={[
                                    <IconButton onClick={refresh}><Refresh/></IconButton>,
                                    currentQ.locked
                                        ? <IconButton onClick={unlock}><Lock/></IconButton>
                                        : <IconButton onClick={lock}><LockOpen/></IconButton>,
                                    <IconButton onClick={deleteQ}><Delete/></IconButton>]}/>,
                                getMathJax(currentQ.prompt, 'subheading'),
                                currentQ.prompts.map((x, y) => getMathJax((y + 1) + ') ' + x, 'body2'))
                            ]
                    }</Card>
                </Grid>
                <Grid item xs={1} style={{textAlign: 'center', marginTop: '10%'}}>
                    <Button variant='fab' onClick={() => {this.setState({questionIndex: index + 1})}} disabled={disableR}>
                    <ArrowForward style={{width: '100%'}}/></Button></Grid>
            </Grid>
        );
    }
}
{/*<MathJax.Context input='tex'><div>*/}
    {/*{['123', <MathJax.Node inline>{eq}</MathJax.Node>, '456']}*/}
{/*</div></MathJax.Context>*/}