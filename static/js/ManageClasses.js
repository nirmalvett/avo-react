import React from 'react';
import Http from './Http';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import List from '@material-ui/core/List/List';
import Paper from '@material-ui/core/Paper/Paper';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ListItem from '@material-ui/core/ListItem/ListItem';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import Stop from '@material-ui/icons/Stop';
import AddBox from '@material-ui/icons/AddBox';
import Delete from '@material-ui/icons/Delete';
import GetApp from '@material-ui/icons/GetApp';
import People from '@material-ui/icons/People';
import NoteAdd from '@material-ui/icons/NoteAdd';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Assessment from '@material-ui/icons/Assessment';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Description from '@material-ui/icons/Description';
import AssignmentTurnedIn from "@material-ui/icons/AssignmentTurnedIn";
import AssignmentNotTurnedIn from "@material-ui/icons/AssignmentLate";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction";
import {copy, getDateString} from "./Utilities";

export default class ManageClasses extends React.Component {
    constructor(props) {
        super(props);
        this.loadClasses();
        this.state = {
            classes: [],
            c: null, // Selected class
            t: null, // Selected test
            createTest: this.props.createTest,
        };
    }

    loadClasses(){
        Http.getClasses(result => this.setState(result), result => console.log(result));
    }

    render() {
        let cardStyle = {marginTop: '10%', marginBottom: '10%', padding: '10px', flex: 1, display: 'flex', flexDirection: 'column'};

        return (
            <div style={{width: '100%', flex: 1, display: 'flex'}}>
                <Grid container spacing={8} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Grid item xs={3} style={{flex: 1, display: 'flex'}}>
                        <Paper square style={{width: '100%', flex: 1, display: 'flex'}}>
                            <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                                {this.state.classes.map((x, y) => [
                                    <ListItem button onClick={() => {
                                        let newClassList = copy(this.state.classes);
                                        if (newClassList[y].tests.length > 0)
                                            newClassList[y].open = !newClassList[y].open;
                                        this.setState({classes: newClassList, c: y, t: null});
                                    }}>
                                        <People color='action'/>
                                        <ListItemText inset primary={x.name}/>
                                        {x.open ?
                                            <ExpandLess color={x.tests.length === 0 ? 'disabled' : 'action'}/> :
                                            <ExpandMore color={x.tests.length === 0 ? 'disabled' : 'action'}/>}
                                    </ListItem>,
                                    <Collapse in={x.open} timeout='auto' unmountOnExit><List>{
                                        x.tests.map((a, b) =>
                                            <ListItem button onClick={() => {
                                                Http.getClassTestResults(this.state.classes[y].tests[b].id, result => {
                                                    this.setState({c: y, t: b, results: result.results});
                                                }, () => {
                                                    this.setState({c: y, t: b, results: []});
                                                });
                                            }}>
                                                <Assessment color={a.open ? 'primary' : 'disabled'} style={{marginLeft: '10px'}}/>
                                                <ListItemText inset primary={a.name}/>
                                            </ListItem>)
                                    }</List></Collapse>
                                ])}
                                <ListItem button onClick={() => this.createClass()}>
                                    <AddBox color='action'/>
                                    <ListItemText inset primary='Create Class'/>
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={2}/>
                    <Grid item xs={5} style={{display: 'flex'}}>
                        <Card style={cardStyle}>{this.detailsCard()}</Card>
                    </Grid>
                </Grid>
            </div>
        );
    }

    detailsCard() {
        let selectedClass = this.state.classes[this.state.c];
        if (this.state.t !== null) {
            let selectedTest = selectedClass.tests[this.state.t];
            return [
                <CardHeader title={selectedTest.name} action={[selectedTest.open
                    ? <IconButton onClick={() => this.closeTest()}><Stop/></IconButton>
                    : <IconButton onClick={() => this.openTest()}><PlayArrow/></IconButton>,
                    <IconButton onClick={() => this.deleteTest()}><Delete/></IconButton>]}/>,
                <List style={{flex: 1, overflowY: 'auto'}} dense>
                    {this.state.results.map((x) => [
                        <ListSubheader>{x.firstName + ' ' + x.lastName}</ListSubheader>,
                        x.tests.length === 0
                            ? <ListItem>
                                <AssignmentNotTurnedIn color='action'/>
                                <ListItemText primary={'This user has not taken any tests yet.'}/>
                            </ListItem>
                            : null,
                        x.tests.map(y => (
                            <ListItem>
                                <AssignmentTurnedIn color='action'/>
                                <ListItemText primary={y.grade + '/' + selectedTest.total}
                                              secondary={'Submitted on ' + getDateString(y.timeSubmitted)}/>
                                <ListItemSecondaryAction><IconButton onClick={() => {this.props.postTest(y.takes)}}>
                                    <Description/>
                                </IconButton></ListItemSecondaryAction>
                            </ListItem>
                        ))
                    ])}
                </List>
            ];
        }
        if (this.state.c !== null) {
            return <CardHeader title={selectedClass.name}
                               subheader={'Enroll Key: ' + selectedClass.enrollKey}
                               action={[
                                   <IconButton onClick={() => this.state.createTest(selectedClass.id)}>
                                       <NoteAdd/>
                                   </IconButton>,
                                   <IconButton onClick={() => alert('CSV download coming soon!')}>
                                       <GetApp/>
                                   </IconButton>
                               ]}/>;
        }
        return null;
    }

    createClass() {
        let name = prompt('Class Name:');
        if (name !== null && name !== '') {
            Http.createClass(name,
                () => this.loadClasses(), // we don't need to alert to refresh anymore
                () => alert('Something went wrong :\'('));
        }
    }

    openTest() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let newClasses = copy(this.state.classes);
        Http.openTest(selectedTest.id, () => {
            newClasses[this.state.c].tests[this.state.t].open = true;
            this.setState({classes: newClasses});
            }, () => {});
    }

    closeTest() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let newClasses = copy(this.state.classes);
        Http.closeTest(selectedTest.id, () => {
            newClasses[this.state.c].tests[this.state.t].open = false;
            this.setState({classes: newClasses});
            }, () => {});
    }

    deleteTest() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let newClasses = copy(this.state.classes);
        Http.deleteTest(selectedTest.id, () => {
            newClasses[this.state.c].tests.splice(this.state.t, 1);
            if (newClasses[this.state.c].tests.length === 0)
                newClasses[this.state.c].open = false;
            this.setState({classes: newClasses, t: null});
            }, () => {});
    }
}