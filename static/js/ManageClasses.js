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
import Divider from '@material-ui/core/Divider';
import Stop from '@material-ui/icons/Stop';
import Downshift from 'downshift';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined';
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined';
import PlayArrow from '@material-ui/icons/PlayArrow';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import MoreVert from '@material-ui/icons/MoreVert';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import AssignmentTurnedIn from "@material-ui/icons/AssignmentTurnedIn";
import AssignmentNotTurnedIn from "@material-ui/icons/AssignmentLate";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction";
import TextField from '@material-ui/core/TextField';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import { copy, getDateString } from "./Utilities";

export default class ManageClasses extends React.Component {
    constructor(props) {
        super(props);
        this.loadClasses();
        this.state = {
            classes: [],
            c: null, // Selected class
            t: null, // Selected test
            createTest: this.props.createTest,
            studentNameSearchLabels : [],
            anchorEl: null,
        };
    }

    loadClasses() {
        Http.getClasses(result => this.setState(result), result => console.log(result));
    }

    render() {
        let cardStyle = { marginBottom: '10%', padding: '10px', flex: 1, display: 'flex', flexDirection: 'column' };

        return (
            <div style={{ width: '100%', flex: 1, display: 'flex' }}>
                <Grid container spacing={8} style={{ flex: 1, display: 'flex', paddingBottom: 0 }}>
                    <Grid item xs={3} style={{ flex: 1, display: 'flex' }}>
                        <Paper classes={{ root: 'avo-sidebar' }} square style={{ width: '100%', flex: 1, display: 'flex' }}>
                            <List style={{ flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px' }}>
                                <center className='open-sans__header'>Manage My Classes</center>
                                <Divider />
                                <ListSubheader style={{ 'position': 'relative' }}>Class Creation & Misc.</ListSubheader>
                                <ListItem button onClick={() => this.createClass()}>
                                    <AddBoxOutlinedIcon color='action' />
                                    <ListItemText inset primary='Create Class' />
                                </ListItem>
                                <Divider />
                                <ListSubheader style={{ 'position': 'relative' }}>My Classes</ListSubheader>
                                {/* For each Class create a menu option */}
                                {this.state.classes.map((x, y) => [
                                    <ListItem button onClick={() => {
                                        let newClassList = copy(this.state.classes);
                                        if (newClassList[y].tests.length > 0)
                                            newClassList[y].open = !newClassList[y].open;
                                        this.setState({ classes: newClassList, c: y, t: null });
                                    }}>
                                        <PeopleOutlinedIcon color='action' />
                                        <ListItemText inset primary={x.name} />
                                        {x.open ?
                                            <ExpandLess color={x.tests.length === 0 ? 'disabled' : 'action'} /> :
                                            <ExpandMore color={x.tests.length === 0 ? 'disabled' : 'action'} />}
                                    </ListItem>,
                                    <Collapse in={x.open} timeout='auto' unmountOnExit><List>
                                        {
                                            // For each test create a menu option
                                            x.tests.map((a, b) =>
                                                <ListItem button onClick={() => {
                                                    Http.getClassTestResults(this.state.classes[y].tests[b].id, result => {
                                                        this.setState({ c: y, t: b, results: result.results });
                                                    }, () => {
                                                        this.setState({ c: y, t: b, results: [] });
                                                    });
                                                }}>
                                                    <AssessmentOutlinedIcon color={a.open ? 'primary' : 'disabled'} style={{ marginLeft: '10px' }} />
                                                    <ListItemText inset primary={a.name} />
                                                </ListItem>)
                                        }</List></Collapse>
                                ])}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={1} />
                    <Grid item xs={7} style={{ display: 'flex' }}>
                        <Card classes={{ root: 'avo-card' }} style={cardStyle}>{this.detailsCard()}</Card>
                    </Grid>
                </Grid>
            </div>
        );
    }

    detailsCard() {
        let selectedClass = this.state.classes[this.state.c];
        if (this.state.t !== null) {
            const { anchorEl } = this.state;
            let selectedTest = selectedClass.tests[this.state.t];
            return [
                <CardHeader
                    classes={{
                        root: 'avo-card__header'
                    }}
                    title={selectedTest.name} action={[selectedTest.open
                        ? <IconButton onClick={() => this.closeTest()}><Stop /></IconButton>
                        : <IconButton onClick={() => this.openTest()}><PlayArrow /></IconButton>,
                    <IconButton onClick={() => this.deleteTest()}><DeleteOutlinedIcon /></IconButton>]} 
                />,

                <List style={{ flex: 1, overflowY: 'auto' }} dense>
                    { /* Show all the students that are in the class*/
                        this.state.results.map((x, idx) => [
                            // <ListSubheader disableSticky={true}>{x.firstName + ' ' + x.lastName}</ListSubheader>,
                            // x.tests.length === 0
                            //     ? <ListItem>
                            //         <AssignmentNotTurnedIn color='action' />
                            //         <ListItemText primary={'This user has not taken any tests yet.'} />
                            //     </ListItem>
                            //     : null,
                            // /* Show all the tests that are in the class*/
                            // x.tests.map(y => (
                            //     <ListItem>
                            //         <AssignmentTurnedIn color='action' />
                            //         <ListItemText primary={y.grade + '/' + selectedTest.total}
                            //             secondary={'Submitted on ' + getDateString(y.timeSubmitted)} />
                            //         <ListItemSecondaryAction><IconButton onClick={() => { this.props.postTest(y.takes) }}>
                            //             <DescriptionOutlinedIcon />
                            //         </IconButton></ListItemSecondaryAction>
                            //     </ListItem>
                            // ))
                            <ListItem>
                                {x.tests.length === 0 ? <AssignmentNotTurnedIn color='action' /> : <AssignmentTurnedIn color='action' />}
                                <ListItemText 
                                    primary={`${x.firstName} ${x.lastName}`} 
                                    secondary={
                                        x.tests[x.tests.length - 1] ? (
                                            x.tests[x.tests.length - 1].grade + '/' + selectedTest.total
                                        ) : (
                                            'This user has not taken any tests yet.'
                                        )
                                    } 
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        aria-owns={anchorEl ? 'simple-menu' : null}
                                        aria-haspopup="true"
                                        student-index={`${idx}`}
                                        onClick={(event) => this.setState({ anchorEl: event.currentTarget })}
                                    >
                                        <MoreVert/>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ])}
                        <Menu
                              id="simple-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => this.handleVertClose()}
                        >
                            <MenuItem value={10}>View More</MenuItem>
                            <MenuItem 
                                value={20} 
                                onClick={() => { 
                                    this.props.postTest(
                                        this.state.results[anchorEl.getAttribute('student-index')].tests[ 
                                            this.state.results[anchorEl.getAttribute('student-index')].tests.length - 1
                                        ].takes
                                    ); 
                                }}
                            >
                                Edit Marks
                            </MenuItem>
                        </Menu>
                </List>
            ];
        }
        if (this.state.c !== null) {
            return <CardHeader
                title={selectedClass.name}
                classes={{
                    root: 'avo-card__header'
                }}
                subheader={'Enroll Key: ' + selectedClass.enrollKey}
                action={[
                    <IconButton onClick={() => this.state.createTest(selectedClass.id)}>
                        <NoteAddOutlinedIcon />
                    </IconButton>,
                    <IconButton onClick={() => alert('CSV download coming soon!')}>
                        <GetAppOutlinedIcon />
                    </IconButton>
                ]} />;
        }
        return (
            <React.Fragment>
                <CardHeader
                    classes={{
                        root: 'avo-card__header'
                    }}
                    title={'Hey there!'}
                />
                <div className='open-sans__text'>
                    Looks like you haven't selected a Class or Test yet!
                </div>
                <br />
            </React.Fragment>
        );
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
            this.setState({ 
                classes: newClasses, 
                studentNameSearchLabels : this.genStudentNameSearchLabels() 
            });
        }, () => { });
    }

    closeTest() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let newClasses = copy(this.state.classes);
        Http.closeTest(selectedTest.id, () => {
            newClasses[this.state.c].tests[this.state.t].open = false;
            this.setState({ classes: newClasses });
        }, () => { });
    }

    deleteTest() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let newClasses = copy(this.state.classes);
        Http.deleteTest(selectedTest.id, () => {
            newClasses[this.state.c].tests.splice(this.state.t, 1);
            if (newClasses[this.state.c].tests.length === 0)
                newClasses[this.state.c].open = false;
            this.setState({ classes: newClasses, t: null });
        }, () => { });
    }

    genStudentNameSearchLabels() {
        const outArray = [];
        for(let i = 0; i < this.state.results.length; i++) {
            outArray.push({ label : `${this.state.results[i].firstName} ${this.state.results[i].lastName}` });
        }
        return(outArray);
    };

    renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }) {
        const isHighlighted = highlightedIndex === index;
        const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;

        return (
            <MenuItem
                {...itemProps}
                key={suggestion.label}
                selected={isHighlighted}
                component="div"
                style={{
                    fontWeight: isSelected ? 500 : 400,
                }}
            >
                {suggestion.label}
            </MenuItem>
        );
    }

    getSuggestion(value) {
        const inputVal = value.toLowerCase();
        const inputLen = value.length;
        return inputLen === 0 ? [] : this.state.studentNameSearchLabels.filter(() => {

        });
    };

    handleVertClick(event) {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleVertClose() {
        this.setState({ anchorEl: null });
    };
}