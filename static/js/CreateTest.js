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
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import IconButton from "@material-ui/core/IconButton/IconButton";

export default class CreateTest extends React.Component {
    constructor(props) {
        super(props);
        Http.getSets((result) => this.setState(result));
        this.state = {
            sets: [
                {id: 1, name: 'Set 1', open: false, questions: [{id: 1, name: 'q1', string: ''}, {id: 2, name: 'q2', string: ''}]},
                {id: 2, name: 'Set 2', open: false, questions: [{id: 3, name: 'q3', string: ''}, {id: 4, name: 'q4', string: ''}]},
                {id: 3, name: 'Set 3', open: false, questions: []},
            ],
            testQuestions: [null],
            questionIndex: 0,
        };
    }

    render() {
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
                                            let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
                                            newTestQuestions[this.state.questionIndex] = {locked: false};
                                            this.setState({testQuestions: newTestQuestions})
                                        }}>
                                            <ListItemText secondary={a.name}/>
                                        </ListItem>)
                                }</List></Collapse>
                            ])}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={2}/>
                <Grid item xs={5} style={{height: '100%', display: 'flex'}}>
                    <Card style={{marginTop: '10%', marginBottom: '10%', padding: '10px', flex: 1}}>{
                        this.state.testQuestions[this.state.questionIndex] !== null
                        ? <CardHeader title={'Question ' + (this.state.questionIndex + 1)}
                                    action={[
                                        this.state.testQuestions[this.state.questionIndex].locked
                                            ? <IconButton onClick={() => {
                                                let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
                                                newTestQuestions[this.state.questionIndex].locked = false;
                                                this.setState({testQuestions: newTestQuestions});
                                            }}><LockIcon/></IconButton>
                                            : <IconButton onClick={() => {
                                                let newTestQuestions = JSON.parse(JSON.stringify(this.state.testQuestions));
                                                newTestQuestions[this.state.questionIndex].locked = true;
                                                this.setState({testQuestions: newTestQuestions});
                                            }}><LockOpenIcon/></IconButton>,
                                        <IconButton><DeleteIcon/></IconButton>]}/>
                        : <CardHeader title={'Question ' + (this.state.questionIndex + 1)}
                                    action={<IconButton><DeleteIcon/></IconButton>}/>
                    }</Card>
                </Grid>
            </Grid>
        );
    }
}