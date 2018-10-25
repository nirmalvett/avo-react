import React from 'react';
import Http from './Http';
import { copy, getDateString } from "./Utilities";
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import List from '@material-ui/core/List/List';
import Paper from '@material-ui/core/Paper/Paper';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ListItem from '@material-ui/core/ListItem/ListItem';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Button from '@material-ui/core/Button/Button';
import AddBox from '@material-ui/icons/AddBox';
import Create from '@material-ui/icons/Create';
import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import Assignment from '@material-ui/icons/Assignment';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import AssignmentLate from '@material-ui/icons/AssignmentLate';
import AssignmentTurnedInOutlinedIcon from '@material-ui/icons/AssignmentTurnedInOutlined';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction";
import { removeDuplicateClasses } from "./helpers";
import { uniqueKey } from "./helpers";

export default class MyClasses extends React.Component {
    constructor(props) {
        super(props);
        this.loadClasses();
        this.state = {
            classes: [],
            c: null, // Selected class
            t: null, // Selected test
            startTest: this.props.startTest,
        };
    }

    loadClasses() {
        /* Loads the classes into the state */
        Http.getClasses(
            (result) => {
                this.setState({ classes: removeDuplicateClasses(result.classes) });
            },
            (result) => {
                console.log(result)
            }
        );
    }
    render() {
        return (
            <div className='avo-user__background' style={{ width: '100%', flex: 1, display: 'flex' }}>
                <Grid container spacing={8} style={{ flex: 1, display: 'flex', paddingBottom: 0 }}>
                    <Grid item xs={3} style={{ flex: 1, display: 'flex' }}>
                        <Paper square style={{ width: '100%', flex: 1, display: 'flex' }}>
                            <List style={{ flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px' }}>
                                {this.state.classes.map((x, y) => [
                                    <ListItem key={uniqueKey()} button onClick={() => {
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
                                    <Collapse in={x.open} timeout='auto' unmountOnExit><List>{
                                        x.tests.map((a, b) =>
                                            <ListItem key={uniqueKey()} button onClick={() => this.setState({ c: y, t: b })}>
                                                <AssessmentOutlinedIcon color={a.open ? 'primary' : 'disabled'} style={{ marginLeft: '10px' }} />
                                                <ListItemText inset primary={a.name} />
                                            </ListItem>)
                                    }</List></Collapse>
                                ])}
                                <ListItem button onClick={() => this.enrollInClass()}>
                                    <AddBox color='action' />
                                    <ListItemText inset primary='Enroll in Class' />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={1} />
                    <Grid item xs={7} style={{ display: 'flex' }}>
                        <Card
                            className='avo-card'
                            style={{
                                marginBottom: '10%',
                                padding: '10px',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {this.detailsCard()}
                        </Card>
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
                <CardHeader
                    classes={{
                        root: 'avo-card__header'
                    }}
                    title={selectedTest.name}
                />,
                <Button
                    color='primary'
                    classes={{
                        root: 'avo-card__header-button avo-button',
                        disabled: 'disabled'
                    }}
                    onClick={() => this.state.startTest(selectedTest.id)}
                    disabled={!(selectedTest.attempts > selectedTest.submitted.length) || (selectedTest.attempts === -1)}
                >
                    Start Test
                </Button>,
                <br/>,
                <Typography>Deadline: {getDateString(selectedTest.deadline)}</Typography>,
                <Typography>Time Limit: {selectedTest.timer} minutes</Typography>,
                <Typography>Attempts:
                    {
                        selectedTest.attempts === -1
                            ? " Unlimited"
                            : " " + selectedTest.attempts
                    }
                </Typography>,
                <br/>,
                <List style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                    {[
                        selectedTest.submitted.map((x, y) => (
                            <ListItem key={uniqueKey()}>
                                <AssignmentTurnedInOutlinedIcon color='action' />
                                <ListItemText primary={'Attempt ' + (y + 1) + ' - ' + x.grade + '/' + selectedTest.total}
                                    secondary={'Submitted on ' + getDateString(x.timeSubmitted)} />
                                <ListItemSecondaryAction><IconButton onClick={() => { this.props.postTest(x.takes) }}>
                                    <DescriptionOutlinedIcon />
                                </IconButton></ListItemSecondaryAction>
                            </ListItem>))
                        // selectedTest.current !== null
                        //     ? <ListItem key={uniqueKey()}>
                        //         <AssignmentLate color='primary' />
                        //         <ListItemText primary='Current Attempt'
                        //             secondary={'Ends on ' + getDateString(selectedTest.current.timeSubmitted)} />
                        //         <ListItemSecondaryAction>
                        //             <IconButton onClick={() => this.state.startTest(selectedTest.id)}><Create /></IconButton>
                        //         </ListItemSecondaryAction>
                        //     </ListItem>
                        //     : (selectedTest.attempts > selectedTest.submitted.length) || (selectedTest.attempts === -1)
                        //         ? <ListItem key={uniqueKey()}>
                        //             <Assignment color='action' /><ListItemText primary='Start Test' />
                        //             <ListItemSecondaryAction>
                        //                 <IconButton onClick={() => this.state.startTest(selectedTest.id)}><Create /></IconButton>
                        //             </ListItemSecondaryAction>
                        //         </ListItem>
                        //         : <ListItem key={uniqueKey()} disabled>
                        //             <Assignment color='disabled' /><ListItemText primary='No attempts left' />
                        //             <ListItemSecondaryAction><IconButton disabled>
                        //                 <Create color='disabled' />
                        //             </IconButton></ListItemSecondaryAction>
                        //         </ListItem>
                    ]}
                </List>
            ];
        }
        if (this.state.c !== null) {
            return (
                <CardHeader
                    classes={{
                        root: 'avo-card__header'
                    }}
                    title={selectedClass.name}
                />
            );
        }
        return null;
    }

    enrollInClass() {
        let key = prompt('Enroll Key:');
        if (key !== null && key !== '') {
            Http.enrollInClass(key,
                () => this.loadClasses(),
                () => alert('Looks like you entered an invalid key.'));
        }
    }


}