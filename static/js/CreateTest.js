import React from 'react';
import Grid from "@material-ui/core/Grid/Grid";
import Paper from "@material-ui/core/Paper/Paper";
import List from "@material-ui/core/List/List";
import ListSubheader from "@material-ui/core/ListSubheader/ListSubheader";
import ListItem from "@material-ui/core/ListItem/ListItem";
import Folder from "@material-ui/icons/Folder";
import FolderOpen from "@material-ui/icons/FolderOpen";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Collapse from "@material-ui/core/Collapse/Collapse";
import Http from "./Http";
import Card from "@material-ui/core/Card/Card";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import DeleteIcon from "@material-ui/icons/Delete";
import RefreshIcon from '@material-ui/icons/Refresh';
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import IconButton from "@material-ui/core/IconButton/IconButton";
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Button from "@material-ui/core/Button/Button";
import MathJax from 'react-mathjax2'
import Typography from "@material-ui/core/Typography/Typography";


export default class CreateTest extends React.Component {
    constructor(props) {
        super(props);
        Http.getSets((result) => this.setState(result));
        this.state = {
            sets: [],
            testQuestions: [],
            questionIndex: -1,
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
        return (
            <Grid container spacing={8} style={{flex: 1, display: 'flex', marginBottom: 0}}>
                <Grid item xs={3} style={{flex: 1, display: 'flex'}}>
                    <Paper style={{width: '100%', flex: 1, display: 'flex'}}>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}} component="nav"
                              subheader={<ListSubheader component="div">Question Sets</ListSubheader>}>
                            {this.state.sets.map((x, y) => [
                                <ListItem button onClick={() => {
                                    let newSetList = JSON.parse(JSON.stringify(this.state.sets));
                                    if (newSetList[y].questions.length > 0)
                                        newSetList[y].open = !newSetList[y].open;
                                    this.setState({sets: newSetList});
                                }}>
                                    {x.open ?
                                        <FolderOpen color={x.questions.length === 0 ? 'disabled' : 'action'}/> :
                                        <Folder color={x.questions.length === 0 ? 'disabled' : 'action'}/>}
                                    <ListItemText inset primary={x.name}/>
                                </ListItem>,
                                <Collapse in={x.open} timeout="auto" unmountOnExit><List>{
                                    x.questions.map((a) =>
                                        <ListItem button onClick={() => {
                                            let seed = Math.floor(Math.random() * 65536);
                                            Http.getQuestion(a.id, seed, (result) => {
                                                let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
                                                newTestQuestions.splice(index + 1, 0,
                                                    {id: a.id, name: a.name, seed: seed, locked: false,
                                                        prompt: result.prompt, prompts: result.prompts});
                                                this.setState({testQuestions: newTestQuestions, questionIndex: index + 1});
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
                    <Button variant='fab' onClick={() => {this.setState({questionIndex: index - 1});}}
                            disabled={index < 1}>
                        <ArrowBack style={{width: '100%'}}/></Button></Grid>
                <Grid item xs={7} style={{display: 'flex'}}>
                    <Card style={{marginTop: '10%', marginBottom: '10%', padding: '10px', flex: 1}}>{
                        this.state.testQuestions.length !== 0
                        ? [<CardHeader
                                title={currentQ.name}
                                subheader={'Question ' + (index + 1) + '/' + this.state.testQuestions.length + ', seed=' + currentQ.seed}
                                action={[
                                    <IconButton onClick={refresh}><RefreshIcon/></IconButton>,
                                    currentQ.locked
                                        ? <IconButton onClick={unlock}><LockIcon/></IconButton>
                                        : <IconButton onClick={lock}><LockOpenIcon/></IconButton>,
                                    <IconButton onClick={deleteQ}><DeleteIcon/></IconButton>]}/>,
                                getMathJax(currentQ.prompt, 'subheading'),
                                currentQ.prompts.map((x, y) => getMathJax((y+1) + ') ' + x, 'body2'))
                            ]
                        : <CardHeader title='No Questions Yet' subheader='Click on a question in the sidebar to add one'/>
                    }</Card>
                </Grid>
                <Grid item xs={1} style={{textAlign: 'center', marginTop: '10%'}}>
                    <Button variant='fab' onClick={() => {this.setState({questionIndex: index + 1});}}
                            disabled={index === this.state.testQuestions.length - 1}>
                    <ArrowForward style={{width: '100%'}}/></Button></Grid>
            </Grid>
        );
    }
}
{/*<MathJax.Context input='tex'><div>*/}
    {/*{['123', <MathJax.Node inline>{eq}</MathJax.Node>, '456']}*/}
{/*</div></MathJax.Context>*/}