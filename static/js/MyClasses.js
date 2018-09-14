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
import AddBoxIcon from '@material-ui/icons/AddBox'
import Http from "./Http";

class MyClasses extends React.Component {
    constructor(props) {
        super(props);
        Http.getClasses(result => this.setState(result), result => console.log(result));
        this.state = {
            path: this.props.path,
            classes: [],
            selectedClass: null,
            selectedTest: null,
        };
    }

    render() {
        // Todo: menu doesn't go to bottom of screen
        return (
            <div style={{width: '100%', flex: 1, display: 'flex'}}>
                <Grid container spacing={8} style={{flex: 1, display: 'flex', marginBottom: 0}}>
                    <Grid item xs={3} style={{flex: 1, display: 'flex'}}>
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
                                                <AssessmentIcon color={a.open ? 'primary' : 'disabled'} style={{marginLeft: '10px'}}/>
                                                <ListItemText inset primary={a.name}/>
                                            </ListItem>)
                                    }</List></Collapse>
                                ])}
                                {this.props.isTeacher
                                    ? <ListItem button onClick={() => {
                                        let name = prompt("Class Name:");
                                        if (name !== null && name !== "") {
                                            Http.createClass(name,
                                                () => alert('Class Created! Navigate out of this section and then back to refresh.'),
                                                () => alert('Something went wrong :\'('));
                                        }
                                        }}>
                                            <AddBoxIcon color='action'/>
                                        <ListItemText inset primary='Create Class'/></ListItem>
                                    : <ListItem button onClick={() => {
                                        let key = prompt("Enroll Key:");
                                        if (key !== null && key !== "") {
                                            Http.enrollInClass(key,
                                                () => alert('Enroll successful! Navigate out of this section and ' +
                                                    'then back to refresh.'),
                                                () => alert('Looks like you entered an invalid key.'));
                                        }
                                        }}>
                                            <AddBoxIcon color='action'/>
                                        <ListItemText inset primary='Enroll in Class'/></ListItem>}
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
                                                ? <IconButton><StopIcon onClick={() => {
                                                    Http.closeTest(this.state.classes[this.state.selectedClass].tests[this.state.selectedTest].id,
                                                        () => {
                                                        let newClasses = JSON.parse(JSON.stringify(this.state.classes));
                                                        newClasses[this.state.selectedClass].tests[this.state.selectedTest].open = false;
                                                        this.setState({classes: newClasses});
                                                        }, () => {})
                                                }}/></IconButton>
                                                : <IconButton><PlayArrowIcon onClick={() => {
                                                    Http.openTest(this.state.classes[this.state.selectedClass].tests[this.state.selectedTest].id,
                                                        () => {
                                                        let newClasses = JSON.parse(JSON.stringify(this.state.classes));
                                                        newClasses[this.state.selectedClass].tests[this.state.selectedTest].open = true;
                                                        this.setState({classes: newClasses})
                                                        }, () => {})
                                                }}/></IconButton>,
                                            <IconButton><DeleteIcon/></IconButton>]}/>
                            {/*Todo - Add mark editor, make buttons do things*/}
                        </Card>
                        : this.state.selectedClass !== null ?
                        <Card style={{marginTop: '10%', marginBottom: '10%', padding: '10px', flex: 1}}>
                            <CardHeader title={this.state.classes[this.state.selectedClass].name}
                                        subheader={'Enroll Key: ' + this.state.classes[this.state.selectedClass].enrollKey}
                                        action={[
                                            <IconButton onClick={() => this.props.createTest()}><NoteAddIcon/></IconButton>,
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