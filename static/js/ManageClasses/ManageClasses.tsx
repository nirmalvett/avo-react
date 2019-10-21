import React, {Component, Fragment} from 'react';
import {
    Button,
    Card,
    CardHeader,
    Collapse,
    Divider,
    FormControl,
    IconButton,
    Input,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    ListSubheader,
    MenuItem,
    Paper,
    Popper,
    Select,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@material-ui/core';
import {
    AddBoxOutlined,
    AssessmentOutlined,
    AssignmentLate,
    AssignmentTurnedIn,
    DeleteOutlined,
    EditOutlined,
    ExpandLess,
    ExpandMore,
    GetAppOutlined,
    NoteAddOutlined,
    PeopleOutlined,
    PlayArrow,
    RemoveRedEyeOutlined,
    Stop,
} from '@material-ui/icons';
import * as Http from '../Http';
import {copy, getDateString} from '../HelperFunctions/Utilities';
import AVOModal from '../SharedComponents/MaterialModal';
// @ts-ignore
import Chart from 'react-apexcharts';
import {convertListFloatToAnalytics} from '../HelperFunctions/Helpers';
import {DateTimePicker} from '@material-ui/pickers';
import {ShowSnackBar} from '../Layout/Layout';
import moment, {Moment} from 'moment';
import {Course} from '../Http/types';
import {GetSections_Test} from "../Http";

const CONST_TAB_OVERALL_ANALYTICS = 0;
const CONST_TAB_PER_QUESTION = 1;
const CONST_TAB_MY_ATTEMPTS = 2;

interface ManageClassesProps {
    courses: Course[];
    sections: Http.GetSections_Section[];
    updateSections: (sections: Http.GetSections_Section[], cb?: () => void) => void;
    showSnackBar: ShowSnackBar;
    theme: {
        color: {
            '100': string;
            '200': string;
            '500': string;
        };
        theme: 'light' | 'dark';
    };
    postTest: (id: number) => void;
    markEditor: (takesID: number) => void;
    createTest: (classID: number) => void;
}

interface ManageClassesState {
    now: number;
    open: {[sectionID: number]: boolean};
    c: null | number;
    t: null | number;
    studentNameSearchLabels: {label: string}[];
    anchorEl: null;
    createClassErrorMessage: string;
    chartWidth: number;
    results: undefined | Http.GetSectionTestResults['results'];
    deleteTestPopperOpen: boolean;
    activeTab: number;
    testStats: null | Http.TestStats;
    testStatsIdx: undefined;
    testStatsDataSelectIdx: number;
    testStatsDataQuestionIdx: number;
    resultsIndexArray: number[];
    editTestPopperOpen: boolean;
    editTest_name: string;
    editTest_timer: string;
    editTest_attempts: string;
    editTest_date: number;
    _editTest_date: number;
    editTest_openTime: number;
    _editTest_openTime: number;
    editTest_confirm_text: string;
    selectedCourseID: number;
}

export default class ManageClasses extends Component<ManageClassesProps, ManageClassesState> {
    constructor(props: ManageClassesProps) {
        super(props);
        this.state = {
            now: Number(new Date()),
            open: {},
            c: null, // Selected class
            t: null, // Selected test
            studentNameSearchLabels: [],
            anchorEl: null,
            createClassErrorMessage: '',
            chartWidth: 200,
            results: undefined,
            deleteTestPopperOpen: false,
            activeTab: 0,
            testStats: null,
            testStatsIdx: undefined,
            testStatsDataSelectIdx: 3,
            testStatsDataQuestionIdx: 0,
            resultsIndexArray: [],

            // Edit Test Settings: Let teacher modify test after it's made
            editTestPopperOpen: false,
            editTest_attempts: '',
            editTest_timer: '',
            editTest_date: Number(new Date()),
            editTest_openTime: Number(new Date()),
            _editTest_date: Number(new Date()),
            _editTest_openTime: Number(new Date()),
            editTest_name: '',
            editTest_confirm_text: 'Confirm', // first time it's Confirm after that it's "Change Again"
            selectedCourseID: this.props.courses[0].courseID,
        };
    }

    componentDidMount() {
        this.handleResize();
        this.loadClasses();
    }

    loadClasses(snackBarString?: string) {
        Http.getSections(result => this.props.updateSections(result.sections), console.warn);
        if (snackBarString !== undefined) {
            this.props.showSnackBar('success', snackBarString, 2000);
        }
    }

    render() {
        return (
            <div style={{width: '100%', flex: 1, display: 'flex'}}>
                <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                    <div style={{flex: 4, display: 'flex'}}>{this.sideBar()}</div>
                    <div style={{flex: 1}} />
                    <div
                        id='avo-apex__chart-container'
                        style={{
                            flex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                            padding: '16px',
                        }}
                    >
                        {this.detailsCard()}
                    </div>
                    <div style={{flex: 1}} />
                </div>
                {this.createClassModal()}{' '}
                {/* This governs the pop up modal that lets profs make a class */}
            </div>
        );
    }

    sideBar() {
        // this renders the side bar for manage classes
        return (
            <Paper
                classes={{root: 'avo-sidebar'}}
                square
                style={{width: '100%', flex: 1, display: 'flex'}}
            >
                <List style={{flex: 1, overflowY: 'auto', paddingTop: 0}}>
                    <ListSubheader style={{position: 'relative'}}>Section Creation</ListSubheader>
                    <ListItem button id='avo-manageclasses__create-button'>
                        <ListItemIcon>
                            <AddBoxOutlined color='action' />
                        </ListItemIcon>
                        <ListItemText primary='Create Section' />
                    </ListItem>
                    <Divider />
                    <ListSubheader style={{position: 'relative'}}>My Sections</ListSubheader>
                    {this.sideBar_loadClasses() /* For each Class create a menu option */}
                </List>
            </Paper>
        );
    }

    getAdjustedCIndex = (cls: Http.GetSections_Section) => {
        return this.props.sections.findIndex(s => s.sectionID === cls.sectionID);
    };

    sideBar_loadClasses() {
        return this.props.sections
            .filter(x => x.role === 'teacher')
            .map((cls, cIndex) => (
                <Fragment key={'ManageClasses' + cls.sectionID + '-' + cIndex}>
                    <ListItem button onClick={() => this.selectClass(this.getAdjustedCIndex(cls))}>
                        <ListItemIcon>
                            <PeopleOutlined color='action' />
                        </ListItemIcon>
                        <ListItemText primary={cls.name} />
                        {this.state.open[cls.sectionID] ? (
                            <ExpandLess color={cls.tests.length === 0 ? 'disabled' : 'action'} />
                        ) : (
                            <ExpandMore color={cls.tests.length === 0 ? 'disabled' : 'action'} />
                        )}
                    </ListItem>
                    <Collapse in={this.state.open[cls.sectionID]} timeout='auto' unmountOnExit>
                        <List>
                            {// For each test create a menu option
                            cls.tests.map((test, tIndex) => (
                                <ListItem
                                    key={`ManageClasses${cls.sectionID}-${cIndex}-${test.testID}-${tIndex}`}
                                    button
                                    onClick={() => {
                                        this.loadEditTestPopper(test);
                                        this.setState({
                                            editTestPopperOpen: false,
                                            deleteTestPopperOpen: false,
                                        }); // close the editTest Popper
                                        this.getTestStats(
                                            test.testID,
                                            this.getAdjustedCIndex(cls),
                                            tIndex,
                                        );
                                    }}
                                >
                                    <ListItemIcon>
                                        <AssessmentOutlined
                                            color={
                                                isOpen(test, this.state.now)
                                                    ? 'primary'
                                                    : 'disabled'
                                            }
                                            style={{marginLeft: '10px'}}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={test.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </Fragment>
            ));
    }

    createClassModal() {
        return (
            <AVOModal
                title='Create a class'
                target='avo-manageclasses__create-button'
                acceptText='Create'
                declineText='Never mind'
                noDefaultClose={true}
                onAccept={(closeFunc: () => void) => {
                    // get the name given
                    const name = (document.getElementById(
                        'avo-manageclasses__creation-textfield',
                    ) as HTMLInputElement).value;
                    if (name !== null && name !== '' && this.state.selectedCourseID) {
                        Http.createSection(
                            this.state.selectedCourseID,
                            name,
                            () => {
                                this.loadClasses('Class Successfully Created!');
                                this.setState({createClassErrorMessage: ''});
                                closeFunc();
                            },
                            () =>
                                this.setState({
                                    createClassErrorMessage:
                                        'Something went wrong :( try again later.',
                                }),
                        );
                    } else {
                        this.setState({
                            createClassErrorMessage:
                                "Your class must have a name, if it doesn't how is anyone going to find it?",
                        });
                    }
                }}
                onDecline={() => {}}
            >
                <br />
                <Typography
                    component={'span'}
                    variant='body1'
                    color='textPrimary'
                    classes={{root: 'avo-padding__16px'}}
                >
                    Please enter the desired name of the course section you wish to create!
                </Typography>
                <TextField
                    id='avo-manageclasses__creation-textfield'
                    margin='normal'
                    style={{width: '60%'}}
                    label='Section name'
                    helperText={this.state.createClassErrorMessage + ' '}
                    error={this.state.createClassErrorMessage !== ''}
                />
                <br />
                <InputLabel htmlFor='course-select'>Course</InputLabel>
                <Select
                    value={this.state.selectedCourseID}
                    onChange={e => this.setState({selectedCourseID: e.target.value as number})}
                    inputProps={{
                        name: 'course select',
                        id: 'course-select',
                    }}
                >
                    {this.props.courses.map(Course => (
                        <MenuItem key={`courseID=${Course.courseID}`} value={Course.courseID}>
                            {Course.name}
                        </MenuItem>
                    ))}
                </Select>
                <br />
            </AVOModal>
        );
    }

    detailsCard() {
        // This is the rendering logic for what goes inside the card on the right
        let selectedClass = this.props.sections[this.state.c as number];
        const uniqueKey1 = '1'; // This is no longer used instead we use proper keys
        if (this.state.t !== null) {
            // If a test is selected
            let {topMarkPerStudent, totalMark} = this.state.testStats as Http.TestStats;
            const analyticsDataObj = convertListFloatToAnalytics(
                topMarkPerStudent,
                totalMark as number,
            );
            let selectedTest = selectedClass.tests[this.state.t as number];
            return this.detailsCard_selectedTest(analyticsDataObj, selectedTest, uniqueKey1);
        }
        if (this.state.c !== null)
            // If a class is selected
            return this.detailsCard_selectedClass(selectedClass, uniqueKey1);
        // Otherwise display the card that says they haven't selected anything
        else return ManageClasses.detailsCard_nothingSelected();
    }

    static detailsCard_nothingSelected() {
        return (
            <Fragment>
                <CardHeader classes={{root: 'avo-card__header'}} title={'Hey there!'} />
                <Typography
                    component={'span'}
                    variant='body1'
                    color='textPrimary'
                    classes={{root: 'avo-padding__16px'}}
                >
                    Looks like you haven't selected a Section or Test yet!
                </Typography>
                <br />
            </Fragment>
        );
    }

    detailsCard_selectedClass(selectedClass: Http.GetSections_Section, uniqueKey1: string) {
        return (
            <Fragment>
                <CardHeader
                    title={selectedClass.name}
                    classes={{root: 'avo-card__header'}}
                    subheader={'Enroll Key: ' + selectedClass.enrollKey}
                    action={
                        <Fragment key={`Action-:${uniqueKey1} ${selectedClass.name}`}>
                            <Tooltip title='Create a new Test'>
                                <IconButton
                                    onClick={() => this.props.createTest(selectedClass.sectionID)}
                                >
                                    <NoteAddOutlined />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title='Download CSV'>
                                <IconButton
                                    onClick={() =>
                                        (window.location.href = `/CSV/SectionMarks/${selectedClass.sectionID}`)
                                    }
                                >
                                    <GetAppOutlined />
                                </IconButton>
                            </Tooltip>
                        </Fragment>
                    }
                />
                <div className='mixed-chart'>
                    {selectedClass.tests.length !== 0 ? ( // if there is at least one test then display data
                        <Fragment>
                            <Chart
                                options={this.generateChartOptions()}
                                series={this.processClassChartData()}
                                type='line'
                                width={this.state.chartWidth}
                            />
                            <Typography
                                component={'span'}
                                variant='body2'
                                color='textPrimary'
                                classes={{root: 'avo-padding__16px'}}
                            >
                                Average: Based on the average of the best attempts of each student
                                who took the test or assignment.
                            </Typography>
                            <Typography
                                component={'span'}
                                variant='body2'
                                color='textPrimary'
                                classes={{root: 'avo-padding__16px'}}
                            >
                                Size: The number of students who has taken the test or assignment.
                            </Typography>
                        </Fragment>
                    ) : (
                        <Typography
                            component={'span'}
                            variant='body1'
                            color='textPrimary'
                            classes={{root: 'avo-padding__16px'}}
                        >
                            This section doesn't have any tests or assignments yet!
                        </Typography>
                    )}
                </div>
            </Fragment>
        );
    }

    detailsCard_selectedTest(
        analyticsDataObj: any,
        selectedTest: Http.GetSections_Test,
        uniqueKey1: string,
    ) {
        return (
            <Fragment key={`detailsCard-${uniqueKey1}`}>
                <CardHeader
                    title={selectedTest.name}
                    action={this.detailsCard_selectedTest_cardHeader(selectedTest)}
                />
                {this.deleteTestPopper(selectedTest)} {/* Logic for deleting a test popup*/}
                {this.editTestPopper(selectedTest)} {/* Logic for editing a test popup*/}
                {/* Deadline: July 01 at 9:30am  Time Limit: 100 minutes  Attempts: Unlimited */}
                <div
                    style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}
                >
                    <Typography component={'span'} variant='body1' color='textPrimary'>
                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Deadline: </b>
                            {getDateString(selectedTest.deadline)}
                        </span>
                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Time Limit:</b>{' '}
                            {selectedTest.timer === -1
                                ? ' None'
                                : ' ' + selectedTest.timer + ' minutes'}
                        </span>
                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Attempts:</b>{' '}
                            {selectedTest.attempts === -1
                                ? ' Unlimited'
                                : ' ' + selectedTest.attempts}
                        </span>
                    </Typography>
                </div>
                <br />
                <Tabs
                    value={this.state.activeTab}
                    onChange={this.handleTabViewChange.bind(this)}
                    indicatorColor='primary'
                    textColor='primary'
                >
                    <Tab label='Overall Analytics' />
                    <Tab label='Per Question Analytics' />
                    <Tab label='Test Submissions' />
                </Tabs>
                {/* These are the three tabs with their data */}
                {/* Shows analytics for the entire test */}
                {this.detailsCard_selectedTest_overallAnalytics(analyticsDataObj)}
                {/* Shows analytics for a single question */}
                {this.detailsCard_selectedTest_perQuestion(analyticsDataObj)}
                {/* Shows the attempts per student */}
                {this.detailsCard_selectedTest_attempts(analyticsDataObj, selectedTest)}
            </Fragment>
        );
    }

    deleteTestPopper(selectedTest: Http.GetSections_Test) {
        return (
            <Popper
                placement='left-start'
                open={this.state.deleteTestPopperOpen}
                anchorEl={() => document.getElementById('avo-manageclasses__delete-button') as any}
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
                <Paper style={{padding: '10px', height: '6em'}}>
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Are you sure you want to delete {selectedTest.name}?
                        <br />
                        Once a test has been deleted it can not be recovered!
                    </Typography>
                    <br />
                    <div style={{float: 'right', position: 'relative'}}>
                        <Button
                            classes={{root: 'avo-button'}}
                            onClick={() => this.setState({deleteTestPopperOpen: false})}
                            color='primary'
                        >
                            Never mind
                        </Button>
                        <Button
                            classes={{root: 'avo-button'}}
                            onClick={() => {
                                this.setState({deleteTestPopperOpen: false});
                                this.deleteTest();
                            }}
                            color='primary'
                        >
                            Delete
                        </Button>
                    </div>
                </Paper>
            </Popper>
        );
    }

    loadEditTestPopper(selectedTest: Http.GetSections_Test) {
        this.setState({
            editTest_name: selectedTest.name,
            editTest_timer: selectedTest.timer.toString(),
            editTest_attempts: selectedTest.attempts.toString(),
            _editTest_date: selectedTest.deadline,
            editTest_date: selectedTest.deadline,
            _editTest_openTime: selectedTest.openTime || Number(new Date()),
            editTest_openTime: selectedTest.openTime || Number(new Date()),
        });
    }

    editTestPopper(selectedTest: Http.GetSections_Test) {
        return (
            <Popper
                placement='left-start'
                open={this.state.editTestPopperOpen}
                anchorEl={() => document.getElementById('avo-manageclasses__delete-button') as any}
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
                <Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
                    <CardHeader title={`Adjust ${selectedTest.name} Settings`} />
                    <TextField
                        margin='normal'
                        label='Name'
                        style={{width: '46%', margin: '2%'}}
                        value={this.state.editTest_name}
                        onChange={e => this.setState({editTest_name: e.target.value})}
                    />
                    <TextField
                        margin='normal'
                        label='Time Limit in Minutes'
                        type='number'
                        style={{width: '46%', margin: '2%'}}
                        value={this.state.editTest_timer}
                        onChange={e => this.setState({editTest_timer: e.target.value})}
                    />
                    <br />
                    <TextField
                        margin='normal'
                        label='Attempts'
                        type='number'
                        style={{width: '46%', margin: '2%'}}
                        value={this.state.editTest_attempts}
                        onChange={e => this.setState({editTest_attempts: e.target.value})}
                    />
                    <DateTimePicker
                        margin='normal'
                        style={{width: '46%', margin: '2%'}}
                        label='Deadline'
                        value={moment(this.state._editTest_date)}
                        onChange={this.handleDateChange}
                        variant='inline'
                    />
                    <DateTimePicker
                        margin='normal'
                        style={{width: '46%', margin: '2%'}}
                        label='Automatic Opening Time'
                        value={moment(this.state._editTest_openTime)}
                        onChange={this.handleOpenTestChange}
                        variant='inline'
                    />
                    <br />
                    <div style={{float: 'right', position: 'relative'}}>
                        <Button
                            classes={{root: 'avo-button'}}
                            onClick={() =>
                                this.setState({
                                    editTestPopperOpen: false,
                                    editTest_confirm_text: 'Confirm', // set back to default
                                    editTest_name: '',
                                })
                            }
                            color='primary'
                        >
                            Close
                        </Button>
                        <Button
                            classes={{root: 'avo-button'}}
                            onClick={() => {
                                Http.changeTest(
                                    selectedTest.testID,
                                    Number(this.state.editTest_timer),
                                    this.state.editTest_name,
                                    Number(new Date(this.state._editTest_date)),
                                    Number(new Date(this.state._editTest_openTime)),
                                    parseInt(this.state.editTest_attempts),
                                    () => {
                                        this.setState({
                                            deleteTestPopperOpen: false,
                                            editTest_confirm_text: 'Change again',
                                        });
                                        this.loadClasses('Change successful!');
                                    },
                                    e => this.props.showSnackBar('error', e.error, 2000),
                                );
                            }}
                            color='primary'
                        >
                            {this.state.editTest_confirm_text}
                        </Button>
                    </div>
                </Card>
            </Popper>
        );
    }

    // handleChangeTest(name: string, timer: number, attempts: number, deadline: number) {
    //     const classes = copy(this.state.classes);
    //     let selectedClass = classes[this.state.c as number];
    //     let selectedTest = selectedClass.tests[this.state.t as number];
    //     selectedTest.name = name;
    //     selectedTest.timer = timer;
    //     selectedTest.attempts = attempts;
    //     selectedTest.deadline = deadline;
    //     this.setState({classes});
    // }

    handleDateChange = (date: Moment | null) => {
        const d = (date as Moment).toDate();
        this.setState({
            editTest_date: Number(d),
            _editTest_date: Number(d),
        });
    };

    handleOpenTestChange = (date: Moment | null) => {
        const d = (date as Moment).toDate();
        this.setState({
            editTest_openTime: Number(d),
            _editTest_openTime: Number(d),
        });
    };

    detailsCard_selectedTest_cardHeader(selectedTest: Http.GetSections_Test) {
        return (
            <Fragment>
                {/* Edit Test Button */}
                <Tooltip title='Edit Test Settings'>
                    <IconButton
                        onClick={() => this.setState({editTestPopperOpen: true})}
                        id='avo-manageclasses__delete-button'
                    >
                        <EditOutlined />
                    </IconButton>
                </Tooltip>
                {/* Start/Stop Test Button*/}
                {isOpen(selectedTest, this.state.now) ? (
                    <Tooltip
                        title={
                            this.state.now > selectedTest.deadline ||
                            this.state.now < selectedTest.openTime
                                ? 'This test has already been closed'
                                : 'Close the test'
                        }
                        placement='bottom'
                    >
                        <span>
                            <IconButton
                                disabled={
                                    this.state.now > selectedTest.deadline ||
                                    this.state.now < selectedTest.openTime
                                }
                                onClick={() => this.closeTest()}
                            >
                                <Stop />
                            </IconButton>
                        </span>
                    </Tooltip>
                ) : (
                    <Tooltip
                        title={
                            this.state.now > selectedTest.deadline
                                ? "This test can't be opened again"
                                : this.state.now < selectedTest.openTime
                                ? "This test can't be opened yet"
                                : 'Open the test'
                        }
                        placement='bottom'
                    >
                        <span>
                            <IconButton
                                disabled={
                                    this.state.now > selectedTest.deadline ||
                                    this.state.now < selectedTest.openTime
                                }
                                onClick={() => this.openTest()}
                            >
                                <PlayArrow />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}
                {/* Delete Test button*/}
                <Tooltip title='Delete the test (This cannot be undone)'>
                    <IconButton
                        onClick={() => this.setState({deleteTestPopperOpen: true})}
                        id='avo-manageclasses__delete-button'
                    >
                        <DeleteOutlined />
                    </IconButton>
                </Tooltip>
            </Fragment>
        );
    }

    detailsCard_selectedTest_overallAnalytics(analyticsDataObj: any) {
        const ts = this.state.testStats as Http.TestStats;
        return (
            <Fragment>
                {this.state.activeTab === CONST_TAB_OVERALL_ANALYTICS && (
                    <Fragment>
                        <div style={{overflowY: 'auto', overflowX: 'hidden'}}>
                            <br />
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                }}
                            >
                                <Typography component={'span'} variant='body1' color='textPrimary'>
                                    <span>
                                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                                            <b>Students:</b>
                                            {analyticsDataObj.studentSizeWhoTookIt}
                                        </span>
                                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                                            <b>Median Scores:</b>
                                            {ts.testMedian}
                                        </span>
                                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                                            <b>Mean Scores:</b>
                                            {ts.testMean}
                                        </span>
                                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                                            <b>Std. Dev:</b>
                                            {ts.testSTDEV}%
                                        </span>
                                    </span>
                                </Typography>
                            </div>
                            <Chart
                                options={this.getTestCardGraphOptions()}
                                series={this.getTestCardGraphSeries()}
                                type='line'
                                width='100%'
                            />
                        </div>
                    </Fragment>
                )}
            </Fragment>
        );
    }

    detailsCard_selectedTest_perQuestion(analyticsDataObj: any) {
        const ts = this.state.testStats as Http.TestStats;
        if (this.state.activeTab === CONST_TAB_PER_QUESTION)
            return (
                <div style={{overflowY: 'auto', overflowX: 'hidden'}}>
                    <br />
                    <Typography component={'span'} variant='body1' color='textPrimary'>
                        <span>
                            <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                                <FormControl>
                                    {/*<InputLabel htmlFor='test-stats__data-display'>Question to display</InputLabel>*/}
                                    <Select
                                        value={this.state.testStatsDataQuestionIdx}
                                        onChange={e =>
                                            this.setState({
                                                testStatsDataQuestionIdx: e.target.value as number,
                                            })
                                        }
                                        input={
                                            <Input
                                                name='dataSelected'
                                                id='test-stats__data-display'
                                            />
                                        }
                                    >
                                        {ts.questions.map((obj, idx) => (
                                            <MenuItem value={idx}>{`Question ${idx + 1}`}</MenuItem>
                                        ))}
                                    </Select>
                                    {/*<FormHelperText>Select the data to be displayed</FormHelperText>*/}
                                </FormControl>
                            </span>
                            <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                                <b>Students:</b> {analyticsDataObj.studentSizeWhoTookIt}
                            </span>
                            <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                                <b>Median:</b>
                                {ts.questions[this.state.testStatsDataQuestionIdx].questionMedian}
                            </span>
                            <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                                <b>Mean:</b>
                                {ts.questions[this.state.testStatsDataQuestionIdx].questionMean}
                            </span>
                            <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                                <b>Std. Dev:</b>
                                {(ts.questions[this.state.testStatsDataQuestionIdx]
                                    .questionSTDEV as number).toFixed(2)}
                                %
                            </span>
                        </span>
                    </Typography>
                    <Chart
                        options={this.getPerQuestionGraphOptions()}
                        series={this.getPerQuestionGraphData()}
                        type='line'
                        width='100%'
                    />
                </div>
            );
    }

    detailsCard_selectedTest_attempts(analyticsDataObj: any, selectedTest: Http.GetSections_Test) {
        const results = this.state.results as Http.GetSectionTestResults['results'];
        if (this.state.activeTab === CONST_TAB_MY_ATTEMPTS)
            return (
                <Fragment>
                    <br />
                    <List style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
                        {/* Show all the students that are in the class*/}
                        {results.map((x, idx) => (
                            <ListItem
                                key={`Student-Card-index:${idx}`}
                                disabled={x.tests.length === 0}
                            >
                                {x.tests.length === 0 ? (
                                    <AssignmentLate color='action' />
                                ) : (
                                    <AssignmentTurnedIn color='action' />
                                )}
                                <ListItemText
                                    primary={`${x.firstName} ${x.lastName}`}
                                    secondary={
                                        x.tests[x.tests.length - 1]
                                            ? x.tests[x.tests.length - 1].grade +
                                              '/' +
                                              selectedTest.total
                                            : 'This user has not taken any tests yet.'
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <FormControl>
                                        <InputLabel htmlFor='test-stats__data-display'>
                                            Attempt
                                        </InputLabel>
                                        <Select
                                            classes={{disabled: 'disabled'}}
                                            disabled={x.tests.length === 0}
                                            value={this.state.resultsIndexArray[idx]}
                                            onChange={evt => {
                                                let tempResults = this.state.resultsIndexArray;
                                                tempResults[idx] = Number(evt.target.value);
                                                this.setState({resultsIndexArray: tempResults});
                                            }}
                                            input={
                                                <Input
                                                    name='dataSelected'
                                                    id='test-stats__data-display'
                                                />
                                            }
                                        >
                                            {results[idx].tests.map((obj, idx) => (
                                                <MenuItem value={idx}>
                                                    {x.tests.length > 1
                                                        ? `Attempt ${idx + 1}`
                                                        : 'Best Attempt'}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Tooltip title='View Submission for selected attempt'>
                                        <span>
                                            {' '}
                                            {/* All icons that can be disabled need this to prevent warning*/}
                                            <IconButton
                                                classes={{disabled: 'disabled'}}
                                                disabled={x.tests.length === 0}
                                                onClick={() => {
                                                    this.props.postTest(
                                                        results[idx].tests[
                                                            this.state.resultsIndexArray[idx]
                                                        ].takesID,
                                                    );
                                                }}
                                            >
                                                <RemoveRedEyeOutlined />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    {/* Edit Marks Button */}
                                    <Tooltip title='Edit marks for selected attempt'>
                                        <IconButton
                                            classes={{
                                                disabled: 'disabled',
                                            }}
                                            disabled={x.tests.length === 0}
                                            onClick={() => {
                                                this.props.markEditor(
                                                    results[idx].tests[
                                                        this.state.resultsIndexArray[idx]
                                                    ].takesID,
                                                );
                                            }}
                                        >
                                            <EditOutlined />
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Fragment>
            );
    }

    // markEditor() {
    //     return (
    //         <Tooltip title='Edit marks for selected attempt'>
    //             <IconButton
    //                 classes={{disabled: 'disabled'}}
    //                 disabled={x.tests.length === 0}
    //                 onClick={() =>
    //                     this.props.markEditor(
    //                         this.state.results[idx].tests[this.state.resultsIndexArray[idx]].takes,
    //                     )
    //                 }
    //             >
    //                 <EditOutlined />
    //             </IconButton>
    //         </Tooltip>
    //     );
    // }

    selectClass(index: number) {
        const open = {...this.state.open};
        if (this.props.sections[index].tests.length > 0)
            open[this.props.sections[index].sectionID] = !open[
                this.props.sections[index].sectionID
            ];
        this.setState({open, c: index, t: null});
    }

    // selectTest(cIndex: number, tIndex: number) {
    //     Http.getClassTestResults(
    //         this.state.classes[cIndex].tests[tIndex].testID,
    //         result =>
    //             this.setState({
    //                 c: cIndex,
    //                 t: tIndex,
    //                 results: result.results,
    //                 editTest_name: '',
    //                 editTestPopperOpen: false,
    //             }),
    //         () =>
    //             this.setState({
    //                 c: cIndex,
    //                 t: tIndex,
    //                 results: [],
    //                 editTest_name: '',
    //                 editTestPopperOpen: false,
    //             }),
    //     );
    // }

    // createClass() {
    //     let name = prompt('Class Name:');
    //     if (name !== null && name !== '') {
    //         Http.createClass(
    //             name,
    //             () => this.loadClasses(),
    //             () => alert("Something went wrong :'("),
    //         );
    //     }
    // }

    openTest() {
        let selectedTest = this.props.sections[this.state.c as number].tests[
            this.state.t as number
        ];
        let newClasses = copy(this.props.sections);
        Http.openTest(
            selectedTest.testID,
            ({openTime}) => {
                newClasses[this.state.c as number].tests[
                    this.state.t as number
                ].openTime = openTime;
                this.props.updateSections(newClasses);
            },
            () => {},
        );
    }

    closeTest() {
        let selectedTest = this.props.sections[this.state.c as number].tests[
            this.state.t as number
        ];
        let newClasses = copy(this.props.sections);
        Http.closeTest(
            selectedTest.testID,
            ({deadline}) => {
                newClasses[this.state.c as number].tests[
                    this.state.t as number
                ].deadline = deadline;
                this.props.updateSections(newClasses);
            },
            () => {},
        );
    }

    deleteTest() {
        let selectedTest = this.props.sections[this.state.c as number].tests[
            this.state.t as number
        ];
        let newClasses = copy(this.props.sections);
        Http.deleteTest(
            selectedTest.testID,
            () => {
                newClasses[this.state.c as number].tests.splice(this.state.t as number, 1);
                const open = {...this.state.open};
                if (newClasses[this.state.c as number].tests.length === 0) {
                    open[newClasses[this.state.c as number].sectionID] = false;
                }
                this.setState({t: null}, () => this.props.updateSections(newClasses));
            },
            () => {},
        );
    }

    genStudentNameSearchLabels() {
        const results = this.state.results as Http.GetSectionTestResults['results'];
        let outArray = [];
        for (let i = 0; i < results.length; i++)
            outArray.push({
                label: `${results[i].firstName} ${results[i].lastName}`,
            });
        return outArray;
    }

    handleResize() {
        const apexContainer = document.getElementById('avo-apex__chart-container');
        if (apexContainer === null) return;
        this.setState({chartWidth: apexContainer.clientWidth - 32});
    }

    getPerQuestionGraphOptions() {
        const ts = this.state.testStats as Http.TestStats;
        let dataObj = convertListFloatToAnalytics(
            ts.questions[this.state.testStatsDataQuestionIdx].topMarksPerStudent as number[],
            ts.questions[this.state.testStatsDataQuestionIdx].totalMark as number,
        );
        return {
            chart: {
                fontFamily: 'Roboto',
                foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                id: 'basic-bar',
                type: 'line',
            },
            colors: [
                `${this.props.theme.color['500']}`,
                `${this.props.theme.color['200']}`,
                `${this.props.theme.color['100']}`,
            ],
            stroke: {
                curve: 'smooth',
            },
            labels: (() => {
                const dataOutArray = [];
                for (let key in dataObj)
                    if (dataObj.hasOwnProperty(key))
                        if (key !== 'studentSizeWhoTookIt') dataOutArray.push(key);
                return dataOutArray;
            })(),
            xaxis: {
                title: {
                    text: this.state.testStatsDataSelectIdx === 3 ? 'Marks Scored' : '',
                },
            },
            yaxis: {
                title: {
                    text:
                        this.state.testStatsDataSelectIdx === 3 ? 'Number of Students' : 'Mark(%)',
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
                ],
            },
            legend: {
                itemMargin: {
                    horizontal: 20,
                    vertical: 5,
                },
                containerMargin: {
                    left: 5,
                    top: 12,
                },
                onItemClick: {
                    toggleDataSeries: true,
                },
                onItemHover: {
                    highlightDataSeries: true,
                },
            },
            dataLabels: {
                enabled: false,
                formatter: (val: any) => val,
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
                    ],
                },
                dropShadow: {
                    enabled: false,
                    top: 1,
                    left: 1,
                    blur: 1,
                    opacity: 0.45,
                },
            },
            tooltip: {
                theme: this.props.theme.theme,
            },
        };
    }

    getPerQuestionGraphData() {
        const x = (this.state.testStats as Http.TestStats).questions[
            this.state.testStatsDataQuestionIdx
        ];
        let dataObj = convertListFloatToAnalytics(
            x.topMarksPerStudent as number[],
            x.totalMark as number,
        );
        delete dataObj['studentSizeWhoTookIt'];
        const dataOutArray = [];
        for (let key in dataObj)
            if (dataObj.hasOwnProperty(key))
                dataOutArray.push((dataObj[key] as {numberOfStudents: number}).numberOfStudents);
        return [
            {
                name: 'Number of Students',
                type: 'column',
                data: dataOutArray,
            },
        ];
    }

    getTestCardGraphOptions() {
        const ts = this.state.testStats as Http.TestStats;
        let selectedTest = this.props.sections[this.state.c as number].tests[
            this.state.t as number
        ];
        return {
            chart: {
                fontFamily: 'Roboto',
                foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                id: 'basic-bar',
                type: 'line',
            },
            colors: [
                `${this.props.theme.color['500']}`,
                `${this.props.theme.color['200']}`,
                `${this.props.theme.color['100']}`,
            ],
            stroke: {
                curve: 'smooth',
            },
            labels:
                this.state.testStatsDataSelectIdx === 2 && selectedTest.submitted.length > 0
                    ? (() => {
                          let attemptArray: string[] = [];
                          selectedTest.submitted.map((obj, idx) => `Attempt ${idx + 1}`);
                          return attemptArray;
                      })()
                    : this.state.testStatsDataSelectIdx === 3
                    ? (() => {
                          const dataObj = convertListFloatToAnalytics(
                              ts.topMarkPerStudent,
                              ts.totalMark as number,
                          );
                          delete dataObj['studentSizeWhoTookIt'];
                          const dataOutArray = [];
                          for (let key in dataObj)
                              if (dataObj.hasOwnProperty(key)) dataOutArray.push(key);
                          return dataOutArray;
                      })()
                    : ['', selectedTest.name, ''],
            xaxis: {
                title: {
                    text: this.state.testStatsDataSelectIdx === 3 ? 'Marks Scored' : '',
                },
            },
            yaxis: {
                title: {
                    text:
                        this.state.testStatsDataSelectIdx === 3 ? 'Number of Students' : 'Mark(%)',
                },
                min: 0,
                max:
                    this.state.testStatsDataSelectIdx === 3
                        ? (() => {
                              const dataObj = convertListFloatToAnalytics(
                                  ts.topMarkPerStudent,
                                  ts.totalMark as number,
                              );
                              return dataObj.studentSizeWhoTookIt;
                          })()
                        : 100,
                tickAmount: (() => {
                    const dataObj = convertListFloatToAnalytics(
                        ts.topMarkPerStudent,
                        ts.totalMark as number,
                    );
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
                ],
            },
            legend: {
                itemMargin: {
                    horizontal: 20,
                    vertical: 5,
                },
                containerMargin: {
                    left: 5,
                    top: 12,
                },
                onItemClick: {
                    toggleDataSeries: true,
                },
                onItemHover: {
                    highlightDataSeries: true,
                },
            },
            dataLabels: {
                enabled: false,
                formatter: (val: any) => val,
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
                    ],
                },
                dropShadow: {
                    enabled: false,
                    top: 1,
                    left: 1,
                    blur: 1,
                    opacity: 0.45,
                },
            },
            tooltip: {
                theme: this.props.theme.theme,
            },
        };
    }

    getTestCardGraphSeries() {
        const ts = this.state.testStats as Http.TestStats;
        let selectedTest = this.props.sections[this.state.c as number].tests[
            this.state.t as number
        ];
        if (this.state.testStatsDataSelectIdx === 0) {
            let testAverage = 0;
            selectedTest.submitted.forEach(obj => (testAverage += obj.grade));
            if (testAverage !== 0)
                testAverage =
                    (testAverage / (selectedTest.total * selectedTest.submitted.length)) * 100;
            return [
                {
                    name: 'Test Mean',
                    type: 'column',
                    data: ['', ts.testMean, ''],
                },
                {
                    name: 'Test Median',
                    type: 'column',
                    data: ['', ts.testMedian, ''],
                },
                {
                    name: 'My Average',
                    type: 'column',
                    data: ['', testAverage, ''],
                },
                {
                    name: 'Test SD',
                    type: 'line',
                    data: ['', ts.testSTDEV, ''],
                },
            ];
        } else if (this.state.testStatsDataSelectIdx === 1) {
            let myBestMark = 0;
            selectedTest.submitted.forEach(
                obj => (myBestMark = obj.grade > myBestMark ? obj.grade : myBestMark),
            );
            myBestMark = (myBestMark / selectedTest.total) * 100;
            return [
                {
                    name: 'Test Mean',
                    type: 'column',
                    data: ['', ts.testMean, ''],
                },
                {
                    name: 'Test Median',
                    type: 'column',
                    data: ['', ts.testMedian, ''],
                },
                {
                    name: 'My Best Attempt',
                    type: 'column',
                    data: ['', myBestMark, ''],
                },
                {
                    name: 'Test SD',
                    type: 'line',
                    data: ['', ts.testSTDEV, ''],
                },
            ];
        } else if (this.state.testStatsDataSelectIdx === 2) {
            let attemptArray: (number | string)[] = [];
            let meanArray: (number | string)[] = []; // It isn't a very nice array :\
            let medianArray: (number | string)[] = [];
            let sdArray: (number | string)[] = [];
            if (selectedTest.submitted.length > 0) {
                selectedTest.submitted.forEach(obj => {
                    attemptArray.push((obj.grade / selectedTest.total) * 100);
                    meanArray.push(ts.testMean);
                    medianArray.push(ts.testMedian);
                    sdArray.push(ts.testSTDEV);
                });
            } else {
                attemptArray = ['', 'No Attempts Available', ''];
                meanArray = ['', ts.testMean, ''];
                medianArray = ['', ts.testMedian, ''];
                sdArray = ['', ts.testSTDEV, ''];
            }
            return [
                {
                    name: 'Test Mean',
                    type: 'column',
                    data: meanArray,
                },
                {
                    name: 'Test Median',
                    type: 'column',
                    data: medianArray,
                },
                {
                    name: 'Test Attempt',
                    type: 'column',
                    data: attemptArray,
                },
                {
                    name: 'Test SD',
                    type: 'line',
                    data: sdArray,
                },
            ];
        } else if (this.state.testStatsDataSelectIdx === 3) {
            const dataObj = convertListFloatToAnalytics(
                ts.topMarkPerStudent,
                ts.totalMark as number,
            );
            delete dataObj['studentSizeWhoTookIt'];
            const dataOutArray = [];
            for (let key in dataObj)
                if (dataObj.hasOwnProperty(key))
                    dataOutArray.push(
                        (dataObj[key] as {numberOfStudents: number}).numberOfStudents,
                    );
            return [
                {
                    name: 'Number of Students',
                    type: 'column',
                    data: dataOutArray,
                },
            ];
        }
        return [
            {
                name: 'TEAM A',
                type: 'column',
                data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
            },
            {
                name: 'TEAM B',
                type: 'column',
                data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
            },
            {
                name: 'TEAM C',
                type: 'line',
                data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
            },
        ];
    }

    handleTabViewChange(event: any, value: number) {
        this.setState({activeTab: value});
    }

    getTestStats(testID: number, cIndex: number, tIndex: number) {
        Http.testStats(
            testID,
            result => {
                Http.getSectionTestResults(
                    this.props.sections[cIndex].tests[tIndex].testID,
                    _result => {
                        let resultsIndexArray = [];
                        for (let i = 0; i < _result.results.length; i++) resultsIndexArray.push(0);
                        this.setState({
                            c: cIndex,
                            t: tIndex,
                            results: _result.results,
                            testStats: result,
                            resultsIndexArray: resultsIndexArray,
                        });
                    },
                    () => this.setState({c: cIndex, t: tIndex, results: [], testStats: result}),
                );
            },
            console.warn,
        );
    }

    processClassChartData() {
        let selectedClass = this.props.sections[this.state.c as number];
        let classAvg = [];
        let classMed = [];
        let classDev = [];
        for (let i = 0; i < selectedClass.tests.length; i++) {
            const testObj = selectedClass.tests[i];
            classMed.push(testObj.sectionMedian.toFixed(2));
            classAvg.push(testObj.sectionAverage.toFixed(2));
            classDev.push(testObj.standardDeviation.toFixed(2));
        }
        return [
            {
                name: 'Section Median (%)',
                type: 'column',
                data: classMed,
            },
            {
                name: 'Section Average (%)',
                type: 'column',
                data: classAvg,
            },
            {
                name: 'SD for Section Avg (%)',
                type: 'column',
                data: classDev,
            },
        ];
    }

    generateChartOptions() {
        let selectedClass = this.props.sections[this.state.c as number];
        let xCategories = [];
        for (let i = 0; i < selectedClass.tests.length; i++) {
            xCategories.push(selectedClass.tests[i].name);
        }
        return {
            chart: {
                fontFamily: 'Roboto',
                foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                id: 'basic-bar',
                type: 'line',
            },
            colors: [
                `${this.props.theme.color['500']}`,
                `${this.props.theme.color['200']}`,
                `${this.props.theme.color['100']}`,
            ],

            xaxis: {
                labels: {
                    formatter: (val: string) => {
                        for (let i = 0; i < selectedClass.tests.length; i++)
                            if (selectedClass.tests[i].name === val)
                                return val + ` (size: ${selectedClass.tests[i].sectionSize})`;
                    },
                },
                categories: xCategories,
            },
            yaxis: {
                min: 0,
                max: 100,
                tickAmount: 10,
                categories: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            },
            fill: {
                opacity: 1.0,
                type: 'solid',
                colors: [
                    `${this.props.theme.color['500']}`,
                    `${this.props.theme.color['200']}`,
                    `${this.props.theme.color['100']}`,
                ],
            },
            legend: {
                markers: {
                    size: 6,
                    strokeColor: '#fff',
                    strokeWidth: 0,
                    offsetX: 0,
                    offsetY: 0,
                    radius: 4,
                    shape: 'circle',
                },
                itemMargin: {
                    horizontal: 20,
                    vertical: 5,
                },
                containerMargin: {
                    left: 5,
                    top: 12,
                },
                onItemClick: {
                    toggleDataSeries: true,
                },
                onItemHover: {
                    highlightDataSeries: true,
                },
            },
            dataLabels: {
                enabled: false,
                formatter: (val: any) => val,
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
                    ],
                },
                dropShadow: {
                    enabled: false,
                    top: 1,
                    left: 1,
                    blur: 1,
                    opacity: 0.45,
                },
            },
            tooltip: {
                theme: this.props.theme.theme,
            },
        };
    }
}

function isOpen(test: GetSections_Test, now: number) {
    return (test.openTime === null || test.openTime < now) && now < test.deadline;
}
