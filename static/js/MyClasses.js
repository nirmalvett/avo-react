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
import Chart from "react-apexcharts";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { avoGreenGraph } from "./AVOCustomColors";
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Popper from '@material-ui/core/Popper';
import paypal from 'paypal-checkout';
import { convertListFloatToAnalytics, getDistribution } from "./helpers";

export default class MyClasses extends React.Component {
    constructor(props) {
        super(props);
        this.loadClasses();
        this.state = {
            classes: [],
            apexChartEl: undefined,            
            c: null, // Selected class
            t: null, // Selected test
            startTest: this.props.startTest,
            enrollErrorMessage : '',
            activeTab : 0,
            testStats : null,
            testStatsIdx : undefined,
            testStatsDataSelectIdx : 3,
            testStatsDataQuestionIdx : 0,
            joinClassPopperOpen: false,
            joinClassPopperIdx: 0
        };
        this.testStatsDataSelectKeys = [
            'Average Attempt',
            'Best Attempt',
            'All Attempts',
            'Distribution'
        ];
    }

    componentDidMount(){
        if (this.props.isTeacher){
            this.props.showSnackBar("info", "Only student account attempts are considered in the analytics")
        }
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
                    {/* Side Menu*/}
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
                                <ListItem button id="avo-myclasses__enroll-button" onClick={() => this.setState({ joinClassPopperOpen : true })}>
                                    <AddBoxOutlinedIcon color='action'/>
                                    <ListItemText inset primary='Enroll in Class'/>
                                </ListItem>
                                <Divider/>
                                <ListSubheader style={{position: 'relative'}}>Classes</ListSubheader>
                                {this.state.classes.map((cls, cIndex) =>
                                    <Fragment key={"MyClasses" + cls.id + "-" + cIndex}>
                                        <ListItem button onClick={() => {
                                            this.selectClass(cIndex);
                                            this.handleClassListItemClick();
                                        }}>
                                            <PeopleOutlinedIcon color='action'/>
                                            <ListItemText inset primary={cls.name}/>
                                            {cls.open
                                                ? <ExpandLess color={cls.tests.length === 0 ? 'disabled' : 'action'}/>
                                                : <ExpandMore color={cls.tests.length === 0 ? 'disabled' : 'action'}/>
                                            }
                                        </ListItem>
                                        <Collapse in={cls.open} timeout='auto' unmountOnExit><List>{
                                            cls.tests.map((test, tIndex) =>
                                                <ListItem 
                                                    key={'MyClasses'+cls.id+'-'+cIndex+'-'+test.id+'-'+tIndex}
                                                    button 
                                                    onClick={() => {
                                                        this.getTestStats(test.id, cIndex, tIndex);
                                                    }}>
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
                    {/* Border From Menu To Main*/}
                    <Grid item xs={1}/>
                    {/* Right hand side cards, see detailsCard() */}
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
                <Popper
                    placement="right-start"
                    open={this.state.joinClassPopperOpen}
                    anchorEl={(() => { return document.getElementById('avo-myclasses__enroll-button')})}
                    disablePortal={false}
                    modifiers={{
                        flip: {
                            enabled: true,
                        },
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: 'scrollParent',
                        },
                    }}
                >
                    <Paper style={{ marginLeft: '10em', padding : '10px', height : 'auto' }}>
                        {this.state.joinClassPopperIdx == 0 && (
                            <React.Fragment>
                                <Typography variant='body1' color="textPrimary">
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
                                <Button
                                    color="primary"
                                    onClick={
                                        () => {
                                            const key = document.getElementById('avo-myclasses__enroll-textfield').value;
                                            if (key !== null && key !== '') {
                                                Http.enrollInClass(
                                                    key,
                                                    () => {
                                                        this.setState({enrollErrorMessage : '', joinClassPopperIdx : 1 });
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
                                        }
                                    }
                                >Enroll</Button>
                            </React.Fragment>
                        )}
                        {this.state.joinClassPopperIdx == 1 && (
                            <React.Fragment>
                                <Typography variant='headline4' color="primary" classes={{root : "avo-padding__16px"}}>
                                    Course code is valid!
                                </Typography>
                                <Typography variant='body1' color="textPrimary" classes={{root : "avo-padding__16px"}}>
                                    To confirm your selection please Pay via PayPal
                                </Typography>
                                <br/>
                                <center><div id="paypal-button"></div></center>
                            
                                {setTimeout(() => {
                                    paypal.Button.render({

                                        env: 'sandbox', // Should be changed to 'production' when in production
                                        commit: true,
                                    
                                        payment: function() {
                                            return paypal.request.post(window.location.hostname + "/pay", {
                                                classID: 1
                                            }).then(function(data) {
                                                return data.tid;
                                            });
                                        },
                                        onAuthorize: function(data) {
                                            return paypal.request.post(window.location.hostname + "/postPay", {
                                                tid: data.paymentID,
                                                payerID: data.payerID
                                            }).then(function(res) {
                                                this.loadClasses();
                                            }).catch(function (err) {
                                                // Do stuff
                                            });
                                        }
                                    }, '#paypal-button')
                                }, 250)
                                }
                            </React.Fragment>
                        )}
                    </Paper>
                </Popper>
                {/* Enroll in class pop up */}
                {/* <AVOModal
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
                </AVOModal> */}
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
        // Class with tests
        if (this.state.t !== null) {
            let selectedTest = selectedClass.tests[this.state.t];
            let bestMark = 0;
            for(let i = 0; i < selectedTest.submitted.length; i++) {
                if(selectedTest.submitted[i].grade > bestMark) bestMark = selectedTest.submitted[i].grade;
            }
            bestMark = (bestMark / selectedTest.total) * 100;
            const analyticsDataObj = (convertListFloatToAnalytics(this.state.testStats.topMarkPerStudent, this.state.testStats.totalMark));
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
                     <center>
                         <Typography variant='body1' color="textPrimary">
                                <span style={{ marginLeft : '0.75em', marginRight : '0.75em' }}>
                                <b>Deadline:</b> {getDateString(selectedTest.deadline)}
                                </span>
                                <span style={{ marginLeft : '0.75em', marginRight : '0.75em' }}>
                                <b>Time Limit:</b> {selectedTest.timer === -1 ? " None" : " " + selectedTest.timer + " minutes"}
                                </span>
                                <span style={{ marginLeft : '0.75em', marginRight : '0.75em' }}>
                                <b>Attempts:</b> {selectedTest.attempts === -1 ? " Unlimited" : " " + selectedTest.attempts}
                                </span>
                         </Typography>
                     </center>
                    <br/>
                    <Tabs
                        value={this.state.activeTab}
                        onChange={this.handleTabViewChange.bind(this)}
                        indicatorColor="primary"
                        textColor="primary"
                        fullWidth
                    >
                        <Tab label="Overall Analytics" />
                        <Tab label="Per Question Analytics" />
                        <Tab label="My Attempts" />
                    </Tabs>
                    {this.state.activeTab === 0 &&
                    (<React.Fragment>
                                <div style={{ overflowY : 'auto', overflowX : 'hidden' }}>
                                    <br/>
                                    <center>
                                        <Typography variant='body1' color="textPrimary">
                                            <span>
                                                <span style={{ marginLeft : '0.75em', marginRight : '0.75em' }}><b>Students:</b> {analyticsDataObj.studentSizeWhoTookIt}</span>
                                                <span style={{ marginLeft : '0.75em', marginRight : '0.75em' }}><b>Median Scores:</b> {this.state.testStats.testMedian}</span>
                                                <span style={{ marginLeft : '0.75em', marginRight : '0.75em' }}><b>Mean Scores:</b> {this.state.testStats.testMean}</span>
                                                <span style={{ marginLeft : '0.75em', marginRight : '0.75em' }}><b>Std. Dev:</b> {this.state.testStats.testSTDEV}%</span>
                                                <span style={{ marginLeft : '0.75em', marginRight : '0.75em' }}><b>My Best Attempt:</b> {Math.round(bestMark/100*this.state.testStats.totalMark, 2)}</span>
                                            </span>
                                        </Typography>
                                    </center>
                                    <br/>
                                    <Chart
                                        options={this.getTestCardGraphOptions()}
                                        series={this.getTestCardGraphSeries()}
                                        type="line"
                                        width='100%'
                                    />
                                </div>
                            </React.Fragment>)
                    }

                    {this.state.activeTab === 1 && (
                        <React.Fragment>
                            <div style={{ overflowY : 'auto', overflowX : 'hidden' }}>
                                <br/>
                                <center>
                                <Typography variant='body1' color="textPrimary">
                                        <span>
                                           <span style={{ marginLeft : '1.0em', marginRight : '1.0em' }}><FormControl>
                                                {/*<InputLabel htmlFor="test-stats__data-display">Question to display</InputLabel>*/}
                                                <Select
                                                    value={this.state.testStatsDataQuestionIdx}
                                                    onChange={(evt) => this.setState({ testStatsDataQuestionIdx : evt.target.value })}
                                                    input={<Input name="dataSelected" id="test-stats__data-display" />}
                                                >
                                                    {this.state.testStats.questions.map((obj, idx) => (
                                                        <MenuItem value={idx}>{`Question ${idx + 1}`}</MenuItem>
                                                    ))}
                                                </Select>
                                                {/*<FormHelperText>Select the data to be displayed</FormHelperText>*/}
                                            </FormControl></span>
                                            <span style={{ marginLeft : '1.0em', marginRight : '1.0em' }}><b>Students:</b> {analyticsDataObj.studentSizeWhoTookIt}</span>
                                            <span style={{ marginLeft : '1.0em', marginRight : '1.0em' }}><b>Median Score:</b> {this.state.testStats.questions[this.state.testStatsDataQuestionIdx].questionMedian}</span>
                                            <span style={{ marginLeft : '1.0em', marginRight : '1.0em' }}><b>Mean Score:</b> {this.state.testStats.questions[this.state.testStatsDataQuestionIdx].questionMean}</span>
                                            <span style={{ marginLeft : '1.0em', marginRight : '1.0em' }}><b>Std. Dev:</b> {this.state.testStats.questions[this.state.testStatsDataQuestionIdx].questionSTDEV.toFixed(2)}%</span>
                                        </span>
                                    </Typography>
                                </center>

                                <Chart
                                    options={this.getPerQuestionGraphOptions()}
                                    series={this.getPerQuestionGraphData()}
                                    type="line"
                                    width='100%'
                                />

                            </div>
                        </React.Fragment>
                    )}
                    {this.state.activeTab === 2 && (
                        <React.Fragment>
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
                        </React.Fragment>
                    )}
                </Fragment>
            );
        }
        // Class with no tests
        else if (this.state.c !== null) {
            return (
                <Fragment>
                    <CardHeader
                        classes={{
                            root: 'avo-card__header'
                        }}
                        title={selectedClass.name}
                    />
                    <Typography variant='body1' color="textPrimary" classes={{root: "avo-padding__16px"}}>
                        {selectedClass.tests.length === 0 && "This class doesn't have any tests or assignments yet!"}
                    </Typography>
                    <div className="mixed-chart" id='avo-apex__chart-container'>
                        { // if there is at least one test then display data
                            selectedClass.tests.length !== 0
                                ?
                                <React.Fragment>
                                  { this.state.apexChartEl }
                                    <Typography variant='body1' color="textPrimary" classes={{root: "avo-padding__16px"}}>
                                      Average: Based on the average of the best attempts of each student who took the test or assignment.
                                    </Typography>
                                    <Typography variant='body1' color="textPrimary" classes={{root: "avo-padding__16px"}}>
                                      Size: The number of students who has taken the test or assignment.
                                    </Typography>
                                </React.Fragment>
                                : null
                        }
                    </div>
                </Fragment>
            );
        }
      // No classes or tests
        else {

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

    getPerQuestionGraphOptions() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let dataObj = convertListFloatToAnalytics(
            this.state.testStats.questions[this.state.testStatsDataQuestionIdx].topMarksPerStudent, 
            this.state.testStats.questions[this.state.testStatsDataQuestionIdx].totalMark
        );
        return {
            chart: {
                fontFamily : 'Roboto',
                foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                id: "basic-bar",
                type: 'line',
            },
            colors: [
                `${this.props.theme.color['500']}`,
                `${this.props.theme.color['200']}`,
                `${this.props.theme.color['100']}`,
            ],
            stroke: {
                curve: 'smooth'
            },
            labels: (() => {
                const dataOutArray = [];
                for(let key in dataObj) {
                    if(key != "studentSizeWhoTookIt") dataOutArray.push(key);
                }
                return dataOutArray;
            })(),
            xaxis: {
                title: {
                    text: this.state.testStatsDataSelectIdx == 3 ? 'Marks Scored' : ''
                },
            },
            yaxis: {
                title: {
                    text: this.state.testStatsDataSelectIdx == 3 ? 'Number of Students' : 'Mark(%)'
                },
                min: 0,
                max: (() => {
                    return dataObj.studentSizeWhoTookIt;
                })(),
                tickAmount: (() => {
                    return dataObj.studentSizeWhoTookIt >= 10 ? 10 : dataObj.studentSizeWhoTookIt;
                })(),
            },
            fill: {
                opacity: 1,
                type: 'solid',
                colors: [
                    `${this.props.theme.color['500']}`,
                    `${this.props.theme.color['200']}`,
                    `${this.props.theme.color['100']}`,
                ]
            },
            legend: {
                itemMargin: {
                    horizontal: 20,
                    vertical: 5
                },
                containerMargin: {
                    left: 5,
                    top: 12,
                },
                onItemClick: {
                    toggleDataSeries: true
                },
                onItemHover: {
                    highlightDataSeries: true
                },
            },
            dataLabels: {
                enabled: false,
                formatter: function (val) {
                    return val
                },
                textAnchor: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    fontSize: '14px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    colors: [
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,                        
                    ]
                },
                dropShadow: {
                    enabled: false,
                    top: 1,
                    left: 1,
                    blur: 1,
                    opacity: 0.45
                }
            },
            tooltip: {
                theme : this.props.theme.theme,
            }
        }
    }

    getPerQuestionGraphData() {
        let dataObj = convertListFloatToAnalytics(
            this.state.testStats.questions[this.state.testStatsDataQuestionIdx].topMarksPerStudent, 
            this.state.testStats.questions[this.state.testStatsDataQuestionIdx].totalMark
        );
        delete dataObj["studentSizeWhoTookIt"];
        const dataOutArray = [];
        for(let key in dataObj) {
            dataOutArray.push(dataObj[key].numberOfStudents);
        }
        return [{
            name: 'Number of Students',
            type: 'column',
            data: dataOutArray
        }];
    }

    getTestCardGraphOptions() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        return {
            chart: {
                fontFamily : 'Roboto',
                foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                id: "basic-bar",
                type: 'line',
            },
            colors: [
                `${this.props.theme.color['500']}`,
                `${this.props.theme.color['200']}`,
                `${this.props.theme.color['100']}`,
            ],
            stroke: {
                curve: 'smooth'
            },
            labels: this.state.testStatsDataSelectIdx == 2 && selectedTest.submitted.length > 0 ? (() => {
                let attemptArray = [];
                selectedTest.submitted.forEach((obj, idx) => {
                    attemptArray.push('Attempt ' + (parseInt(idx) + 1));
                });
                return attemptArray;
            })(): this.state.testStatsDataSelectIdx == 3 ? (() => {
                const dataObj = (convertListFloatToAnalytics(this.state.testStats.topMarkPerStudent, this.state.testStats.totalMark));
                delete dataObj["studentSizeWhoTookIt"];
                const dataOutArray = [];
                for(let key in dataObj) {
                    dataOutArray.push(key);
                }
                return dataOutArray;
            })(): ['', selectedTest.name, ''],
            xaxis: {
                title: {
                    text: this.state.testStatsDataSelectIdx == 3 ? 'Marks Scored' : ''
                },
            },
            yaxis: {
                title: {
                    text: this.state.testStatsDataSelectIdx == 3 ? 'Number of Students' : 'Mark(%)'
                },
                min: 0,
                max: this.state.testStatsDataSelectIdx == 3 ? (() => {
                    const dataObj = (convertListFloatToAnalytics(this.state.testStats.topMarkPerStudent, this.state.testStats.totalMark));
                    return dataObj.studentSizeWhoTookIt;
                })() : 100,
                tickAmount: (() => {
                    const dataObj = (convertListFloatToAnalytics(this.state.testStats.topMarkPerStudent, this.state.testStats.totalMark));
                    return dataObj.studentSizeWhoTookIt >= 10 ? 10 : dataObj.studentSizeWhoTookIt;
                })(),
            },
            fill: {
                opacity: 1,
                type: 'solid',
                colors: [
                    `${this.props.theme.color['500']}`,
                    `${this.props.theme.color['200']}`,
                    `${this.props.theme.color['100']}`,
                ]
            },
            legend: {
                itemMargin: {
                    horizontal: 20,
                    vertical: 5
                },
                containerMargin: {
                    left: 5,
                    top: 12,
                },
                onItemClick: {
                    toggleDataSeries: true
                },
                onItemHover: {
                    highlightDataSeries: true
                },
            },
            dataLabels: {
                enabled: false,
                formatter: function (val) {
                    return val
                },
                textAnchor: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    fontSize: '14px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    colors: [
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,                        
                    ]
                },
                dropShadow: {
                    enabled: false,
                    top: 1,
                    left: 1,
                    blur: 1,
                    opacity: 0.45
                }
            },
            tooltip: {
                theme : this.props.theme.theme,
            }
        }
    };

    getTestCardGraphSeries() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t]; 
        if(this.state.testStatsDataSelectIdx === 0) {
            let testAverage = 0;
            selectedTest.submitted.forEach((obj) => {
                testAverage += obj.grade;
            });
            if(testAverage != 0) {
                testAverage = (testAverage / (selectedTest.total * selectedTest.submitted.length)) * 100
            }
            return [{
                name : 'Test Mean',
                type : 'column',
                data : ['', this.state.testStats.testMean, '']
            }, {
                name : 'Test Median',
                type : 'column',
                data : ['', this.state.testStats.testMedian, '']
            }, {
                name : 'My Average',
                type : 'column',
                data : ['', testAverage, '']
            },{
                name : 'Test SD',
                type : 'line',
                data : ['', this.state.testStats.testSTDEV, '']
            }, ]
        }else if (this.state.testStatsDataSelectIdx === 1) {
            let myBestMark = 0;
            selectedTest.submitted.forEach((obj) => {
                myBestMark = obj.grade > myBestMark ? obj.grade : myBestMark;
            });
            myBestMark = (myBestMark / selectedTest.total) * 100;
            return [{
                name : 'Test Mean',
                type : 'column',
                data : ['', this.state.testStats.testMean, '']
            }, {
                name : 'Test Median',
                type : 'column',
                data : ['', this.state.testStats.testMedian, '']
            }, {
                name : 'My Best Attempt',
                type : 'column',
                data : ['', myBestMark, '']
            }, {
                name : 'Test SD',
                type : 'line',
                data : ['', this.state.testStats.testSTDEV, '']
            }, ]
        }else if (this.state.testStatsDataSelectIdx === 2) {
            let attemptArray = [];
            let meanArray    = []; // It isnt a very nice array :\
            let medianArray  = [];
            let sdArray      = [];
            if(selectedTest.submitted.length > 0) {
                selectedTest.submitted.forEach((obj) => {
                    attemptArray.push((obj.grade / selectedTest.total) * 100);
                    meanArray   .push(this.state.testStats.testMean);
                    medianArray .push(this.state.testStats.testMedian);
                    sdArray     .push(this.state.testStats.testSTDEV);
                });
            }else{
                attemptArray = ['', 'No Attempts Availible', ''];
                meanArray    = ['', this.state.testStats.testMean, ''];
                medianArray  = ['', this.state.testStats.testMedian, ''];
                sdArray      = ['', this.state.testStats.testSTDEV, ''];
            }
            return [{
                name : 'Test Mean',
                type : 'column',
                data : meanArray
            }, {
                name : 'Test Median',
                type : 'column',
                data : medianArray
            }, {
                name : 'Test Attempt',
                type : 'column',
                data : attemptArray
            }, {
                name : 'Test SD',
                type : 'line',
                data : sdArray
            }, ]
        }else if(this.state.testStatsDataSelectIdx === 3) {
            const dataObj = (convertListFloatToAnalytics(this.state.testStats.topMarkPerStudent, this.state.testStats.totalMark));
            delete dataObj["studentSizeWhoTookIt"];
            const dataOutArray = [];
            for(let key in dataObj) {
                getDistribution(this.state.testStats.testSTDEV, this.state.testStats.testMedian, dataOutArray.length);
                dataOutArray.push(dataObj[key].numberOfStudents);
            }
            return [{
                name: 'Number of Students',
                type: 'column',
                data: dataOutArray
            }]
        }
        return [{
            name: 'TEAM A',
            type: 'column',
            data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
        }, {
            name: 'TEAM B',
            type: 'column',
            data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
        }, {
            name: 'TEAM C',
            type: 'line',
            data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
        }]
    };

    handleTabViewChange(event, value) {
        this.setState({ activeTab : value });
    };

    enrollInClass() {
        let key = prompt('Enroll Key:');
        if (key !== null && key !== '') {
            Http.enrollInClass(key,
                () => this.loadClasses(),
                () => alert('Looks like you entered an invalid key.'));
        }
    }

    getTestStats(testID, cIndex, tIndex) {
        Http.getTestStats(
            testID,
            (result) => { 
                console.log(result);
                this.setState({c: cIndex, t: tIndex, testStats: result });
            },
            (err) => { console.log(err); }
        )
    };

    handleClassListItemClick() {
        this.setState({ apexChartEl : undefined });
        setTimeout(() => {
            let apexContainerWidth = parseInt(document.getElementById('avo-apex__chart-container').clientWidth);
            this.setState({ apexChartEl : (
                <Chart
                    options={this.generateChartOptions()}
                    series={this.processClassChartData()}
                    type="line"
                    width={apexContainerWidth}
                />
            ) });
            window.onresize = this.handleResize.bind(this);
        }, 50);
    };

    handleResize() {
        this.setState({ apexChartEl : 'loading...' });
        let apexContainerWidth = parseInt(document.getElementById('avo-apex__chart-container').clientWidth);
        this.setState({ apexChartEl : (
            <Chart
                options={this.generateChartOptions()}
                series={this.processClassChartData()}
                type="line"
                width={apexContainerWidth}
            />
        ) });
    }

    processClassChartData() {
        let selectedClass = this.state.classes[this.state.c];
        let classAvg = [];
        let myMark = [];
        let standardDev = [];
        for(let i = 0; i < selectedClass.tests.length; i++) {
            const testObj = selectedClass.tests[i];
            classAvg.push(parseFloat(testObj.classAverage).toFixed(2));
            standardDev.push(parseFloat(testObj.standardDeviation).toFixed(2));
            let myAvg = -1;
            for(let j = 0; j < testObj.submitted.length; j++) {
                let takeObj = testObj.submitted[j];
                myAvg = takeObj.grade > myAvg ? takeObj.grade : myAvg;
            } 
            if(testObj.submitted.length > 0) {
                myAvg = (myAvg / testObj.total)*100;
                myMark.push(parseFloat(myAvg).toFixed(2));
            }else{
                myMark.push('Test or Assignment has not been taken');
            }
        }
        return [{
            name : 'My Best Attempt (%)',
            type : 'column',
            data : myMark
        }, {
            name : 'Class Average (%)',
            type : 'column',
            data : classAvg
        }, {
            name : 'SD for Class Avg (%)',
            type : 'column',
            data : standardDev
        }]
    }

    generateChartOptions() {
        let selectedClass = this.state.classes[this.state.c];
        let xCategories = [];
        for(let i = 0; i < selectedClass.tests.length; i++) {
            xCategories.push(selectedClass.tests[i].name);
        }
        return {
            chart: {
                fontFamily : 'Roboto',
                foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                id: "basic-bar",
                type: 'line',
            },
            colors: [
                `${this.props.theme.color['500']}`,
                `${this.props.theme.color['200']}`,
                `${this.props.theme.color['100']}`,
            ],
            xaxis: {
                labels: {
                    formatter: (val) => {
                        for(let i = 0; i < selectedClass.tests.length; i++) {
                            if(selectedClass.tests[i].name == val) {
                                return val + ` (size: ${selectedClass.tests[i].classSize})`;
                            }
                        }
                    }
                },
                categories: xCategories,
            },
            yaxis: {
                min: 0,
                max: 100,
                tickAmount: 10,
                catagories: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            },
            fill: {
                opacity: 1,
                type: 'solid',
                colors: [
                    `${this.props.theme.color['500']}`,
                    `${this.props.theme.color['200']}`,
                    `${this.props.theme.color['100']}`,
                ]
            },
            legend: {
                itemMargin: {
                    horizontal: 20,
                    vertical: 5
                },
                containerMargin: {
                    left: 5,
                    top: 12,
                },
                onItemClick: {
                    toggleDataSeries: true
                },
                onItemHover: {
                    highlightDataSeries: true
                },
            },
            dataLabels: {
                enabled: false,
                formatter: function (val) {
                    return val
                },
                textAnchor: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    fontSize: '14px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    colors: [
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,                        
                    ]
                },
                dropShadow: {
                    enabled: false,
                    top: 1,
                    left: 1,
                    blur: 1,
                    opacity: 0.45
                }
            },
            tooltip: {
                theme : this.props.theme.theme,
            }
        }
    }
}