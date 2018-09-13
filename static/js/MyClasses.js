import React from 'react';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import ListItem from '@material-ui/core/ListItem/ListItem';
import List from '@material-ui/core/List/List';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Paper from '@material-ui/core/Paper/Paper';
import PeopleIcon from '@material-ui/icons/People';
import AssessmentIcon from '@material-ui/icons/Assessment';
import Card from "@material-ui/core/Card/Card";
import Grid from "@material-ui/core/Grid/Grid";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import IconButton from "@material-ui/core/IconButton/IconButton";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import NoteAddIcon from '@material-ui/icons/NoteAdd';

class MyClasses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            path: this.props.path,
            classes: [
                {id: 1, name: 'Class 1', enrollKey: 'enrollKey1', tests: [{id: 1, name: 'Test 1', open: true}, {id: 2, name: 'Test 2', open: false}]},
                {id: 2, name: 'Class 2', enrollKey: 'enrollKey2', tests: [{id: 3, name: 'Test 3', open: false}]},
                {id: 3, name: 'Class 3', enrollKey: 'enrollKey3', tests: [{id: 4, name: 'Test 4', open: false}, {id: 5, name: 'Test 5', open: true}, {id: 6, name: 'Test 6', open: false}]},
                {id: 4, name: 'Class 4', enrollKey: 'enrollKey4', tests: []}
            ],
            selectedClass: null,
            selectedTest: null,
        };
    }

    render() {
        // Todo: menu doesn't go to bottom of screen
        return (
            <div style={{width: '100%', height: '100%', display: 'flex'}}>
                <Grid container spacing={8} style={{height: '100%', marginBottom: 0}}>
                    <Grid item xs={3} style={{height: '100%', display: 'flex'}}>
                        <Paper style={{width: '100%', flex: 1, display: 'flex'}}>
                            <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}} component="nav"
                                  subheader={<ListSubheader component="div">My Classes</ListSubheader>}>
                                {this.state.classes.map((x, y) => [
                                    <ListItem button onClick={() => {
                                        let newClassList = JSON.parse(JSON.stringify(this.state.classes));
                                        if (newClassList[y].tests.length > 0)
                                            newClassList[y].open = !newClassList[y].open;
                                        this.setState({classes: newClassList, selectedClass: y, selectedTest: null});
                                    }}>
                                        <PeopleIcon color='action'/>
                                        <ListItemText inset primary={x.name}/>
                                        {x.open ?
                                            <ExpandLess color={x.tests.length === 0 ? 'disabled' : 'action'}/> :
                                            <ExpandMore color={x.tests.length === 0 ? 'disabled' : 'action'}/>}
                                    </ListItem>,
                                    <Collapse in={x.open} timeout="auto" unmountOnExit><List>{
                                        x.tests.map((a, b) =>
                                            <ListItem button onClick={() => this.setState({selectedClass: y, selectedTest: b})}>
                                                <AssessmentIcon color='action' style={{marginLeft: '10px'}}/>
                                                <ListItemText inset primary={a.name}/>
                                            </ListItem>)
                                    }</List></Collapse>
                                ])}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={2}/>
                    <Grid item xs={5} style={{height: '100%', display: 'flex'}}>{
                        this.state.selectedTest !== null ?
                        <Card style={{marginTop: '10%', marginBottom: '10%', padding: '10px', flex: 1}}>
                            <CardHeader title={this.state.classes[this.state.selectedClass].tests[this.state.selectedTest].name}
                                        action={[
                                            this.state.classes[this.state.selectedClass].tests[this.state.selectedTest].open
                                                ? <IconButton><StopIcon/></IconButton>
                                                : <IconButton><PlayArrowIcon/></IconButton>,
                                            <IconButton><DeleteIcon/></IconButton>]}/>
                            {/*Todo - Add mark editor, make buttons do things*/}
                        </Card>
                        : this.state.selectedClass !== null ?
                        <Card style={{marginTop: '10%', marginBottom: '10%', padding: '10px', flex: 1}}>
                            <CardHeader title={this.state.classes[this.state.selectedClass].name}
                                        subheader={'Enroll Key: ' + this.state.classes[this.state.selectedClass].enrollKey}
                                        action={[
                                            <IconButton><NoteAddIcon/></IconButton>,
                                            <IconButton><GetAppIcon/></IconButton>
                                        ]}/>
                            {/*Todo - Add 'Add Test' button, results graphics for class and individual, make button download csv*/}
                        </Card>
                        : null
                    }</Grid>
                </Grid>
            </div>
        );
    }
}

export default MyClasses