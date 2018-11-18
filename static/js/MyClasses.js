import React, {Fragment} from 'react';
import Http from './Http';
import { copy, getDateString } from "./Utilities";
import Card from '@material-ui/core/Card/Card';
import TextField from '@material-ui/core/TextField/TextField';
import Grid from '@material-ui/core/Grid/Grid';
import List from '@material-ui/core/List/List';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper/Paper';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ListItem from '@material-ui/core/ListItem/ListItem';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import Button from '@material-ui/core/Button/Button';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import BarChartOutlinedIcon from '@material-ui/icons/BarChartOutlined';
import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction";
import { removeDuplicateClasses } from "./helpers";
import Tooltip from '@material-ui/core/Tooltip';
import AVOModal from './AVOMatComps/AVOMatModal';


export default class MyClasses extends React.Component {
    constructor(props) {
        super(props);
        this.loadClasses();
        this.state = {
            classes: [],
            c: null, // Selected class
            t: null, // Selected test
            startTest: this.props.startTest,
            enrollErrorMessage : '',
        };
    }

    loadClasses() {
        /* Loads the classes into the state */
        Http.getClasses(
            (result) => {
                // Todo: removing duplicates should be unnecessary
                this.setState({classes: removeDuplicateClasses(result.classes)});
            },
            (result) => {
                console.log(result)
            }
        );
    }

    render() {
        return (
            <div className='avo-user__background' style={{width: '100%', flex: 1, display: 'flex'}}>
                <Grid container spacing={8} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Grid item xs={3} style={{flex: 1, display: 'flex'}}>
                        <Paper classes={{root : 'avo-sidebar'}} square style={{width: '100%', flex: 1, display: 'flex'}}>
                            <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                                <Typography variant='subheading' color="textPrimary" align='center'>
                                    Welcome to My Classes
                                </Typography>
                                <br/>
                                <Divider/>
                                <ListSubheader style={{position: 'relative'}}>Analytics & Enrollment</ListSubheader>
                                <ListItem button disabled>
                                    <BarChartOutlinedIcon color='action'/>
                                    <ListItemText inset primary='My Analytics'/>
                                </ListItem>
                                <ListItem button id="avo-myclasses__enroll-button">
                                    <AddBoxOutlinedIcon color='action'/>
                                    <ListItemText inset primary='Enroll in Class'/>
                                </ListItem>
                                <Divider/>
                                <ListSubheader style={{position: 'relative'}}>Classes</ListSubheader>
                                {this.state.classes.map((cls, cIndex) =>
                                    <Fragment key={"MyClasses" + cls.id + "-" + cIndex}>
                                        <ListItem button onClick={() => this.selectClass(cIndex)}>
                                            <PeopleOutlinedIcon color='action'/>
                                            <ListItemText inset primary={cls.name}/>
                                            {cls.open
                                                ? <ExpandLess color={cls.tests.length === 0 ? 'disabled' : 'action'}/>
                                                : <ExpandMore color={cls.tests.length === 0 ? 'disabled' : 'action'}/>
                                            }
                                        </ListItem>
                                        <Collapse in={cls.open} timeout='auto' unmountOnExit><List>{
                                            cls.tests.map((test, tIndex) =>
                                                <ListItem key={'MyClasses'+cls.id+'-'+cIndex+'-'+test.id+'-'+tIndex}
                                                          button onClick={() => this.setState({c: cIndex, t: tIndex})}>
                                                    <AssessmentOutlinedIcon color={test.open ? 'primary' : 'disabled'}
                                                                            style={{marginLeft: '10px'}}/>
                                                    <ListItemText inset primary={test.name}/>
                                                </ListItem>)
                                        }</List></Collapse>
                                    </Fragment>
                                )}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={1}/>
                    <Grid item xs={7} style={{display: 'flex'}}>
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
                <AVOModal
                    title='Enroll into a class'
                    target="avo-myclasses__enroll-button"
                    acceptText='Enroll'
                    declineText='Never mind'
                    noDefaultClose={true}
                    onAccept={(closeFunc) => {
                        const key = document.getElementById('avo-myclasses__enroll-textfield').value;
                        if (key !== null && key !== '') {
                            Http.enrollInClass(
                                key,
                                () => {
                                    this.loadClasses();
                                    this.setState({enrollErrorMessage : ''});
                                    closeFunc();
                                },
                                () => this.setState({
                                    enrollErrorMessage : 'Invalid code'
                                }),
                            )
                        } else {
                            this.setState({
                                enrollErrorMessage : 'Field cannot be blank. Please enter a code to join a class.'
                            });
                        }
                    }}
                    onDecline={() => {}}
                >
                    <Fragment>
                        <br/>
                        <Typography variant='body1' color="textPrimary" classes={{root : "avo-padding__16px"}}>
                            Please enter the course code for the class you want to enroll in!
                        </Typography>
                        <TextField
                            id='avo-myclasses__enroll-textfield'
                            margin='normal'
                            style={{width: '60%'}}
                            label="Course code"
                            helperText={this.state.enrollErrorMessage + ' '}
                            error={this.state.enrollErrorMessage !== ''}
                        />
                        <br/>
                    </Fragment>
                </AVOModal>
            </div>
        );
    }

    selectClass(index) {
        let newClassList = copy(this.state.classes);
        if (newClassList[index].tests.length > 0)
            newClassList[index].open = !newClassList[index].open;
        this.setState({classes: newClassList, c: index, t: null});
    }

    detailsCard() {
        let selectedClass = this.state.classes[this.state.c];
        if (this.state.t !== null) {
            let selectedTest = selectedClass.tests[this.state.t];
            let disableStartTest = !selectedTest.open
                && (selectedTest.attempts === -1 || selectedTest.submitted.length < selectedTest.attempts);
            return (
                <Fragment>
                    <CardHeader
                        classes={{
                            root: 'avo-card__header'
                        }}
                        title={selectedTest.name}
                    />
                    <Button
                        color='primary'
                        classes={{
                            root: 'avo-card__header-button',
                            disabled: 'disabled'
                        }}
                        onClick={() => this.state.startTest(selectedTest)}
                        disabled={disableStartTest}
                    >
                        {selectedTest.current === null ? 'Start Test' : 'Resume Test'}
                    </Button>
                    <br/>
                    <Typography variant='body1' color="textPrimary" classes={{root : "avo-padding__16px"}}>
                        <b>Deadline:</b> {getDateString(selectedTest.deadline)}
                    </Typography>
                    <Typography variant='body1' color="textPrimary" classes={{root : "avo-padding__16px"}}>
                        <b>Time Limit:</b> {selectedTest.timer} minutes
                    </Typography>
                    <Typography variant='body1' color="textPrimary" classes={{root : "avo-padding__16px"}}>
                        <b>Attempts:</b> {selectedTest.attempts === -1 ? " Unlimited" : " " + selectedTest.attempts}
                    </Typography>
                    <br/>
                    <List style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
                        {selectedTest.submitted.map((x, y) => (
                            <ListItem key={'MyClasses' + x.id}>
                                <ListItemText primary={'Attempt ' + (y + 1) + ' - ' + x.grade + '/' + selectedTest.total}
                                    secondary={'Submitted on ' + getDateString(x.timeSubmitted)}/>
                                <ListItemSecondaryAction>
                                    <Tooltip title="View previous test results">
                                        <IconButton onClick={() => {this.props.postTest(x.takes)}}>
                                            <DescriptionOutlinedIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Fragment>
            );
        }
        if (this.state.c !== null) {
            return (
                <Fragment>
                    <CardHeader
                        classes={{
                            root: 'avo-card__header'
                        }}
                        title={selectedClass.name}
                    />
                    <Typography variant='body1' color="textPrimary" classes={{root: "avo-padding__16px"}}>
                        {selectedClass.tests.length === 0 && "This class doesn't have any tests yet!"}
                    </Typography>
                </Fragment>
            );
        }
        return (
            <Fragment>
                <CardHeader
                    classes={{
                        root: 'avo-card__header'
                    }}
                    title={'Hey there!'}
                />
                <Typography variant='body1' color="textPrimary" classes={{root: "avo-padding__16px"}}>
                    Looks like you haven't selected a Class or Test yet!
                </Typography>
                <br/>
            </Fragment>
        );
    }
}