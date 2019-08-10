import React, {Component, Fragment, ReactElement} from 'react';
import * as Http from '../Http';
import {copy, getDateString} from '../HelperFunctions/Utilities';
import {convertListFloatToAnalytics} from '../HelperFunctions/Helpers';
import {
    Tab,
    Card,
    Tabs,
    List,
    Input,
    Paper,
    Button,
    Select,
    Popper,
    Tooltip,
    Divider,
    Collapse,
    ListItem,
    MenuItem,
    TextField,
    CardHeader,
    IconButton,
    Typography,
    FormControl,
    ListItemText,
    ListSubheader,
    ListItemSecondaryAction,
} from '@material-ui/core';
import {
    ExpandLess,
    ExpandMore,
    AddBoxOutlined as AddBoxOutlinedIcon,
    PeopleOutlined as PeopleOutlinedIcon,
    AssessmentOutlined as AssessmentOutlinedIcon,
    DescriptionOutlined as DescriptionOutlinedIcon,
} from '@material-ui/icons';
// @ts-ignore
import Chart from 'react-apexcharts';
// @ts-ignore
import paypal from 'paypal-checkout';
// @ts-ignore
import paypal_mode from 'js-yaml-loader!../../../config.yaml';
import {ShowSnackBar} from '../Layout/Layout';

const CONST_TAB_OVERALL_ANALYTICS = 0;
const CONST_TAB_PER_QUESTION = 1;
const CONST_TAB_MY_ATTEMPTS = 2;

const CONST_ENROLL_TAB = 0;
const CONST_PAYMENT_TAB = 1;

const CONST_OVERALL_ANALYTICS_DEFAULT = 3;
// noinspection JSUnresolvedVariable
let PAYPAL_MODE = JSON.parse(paypal_mode.slice(18, -2)).paypal_mode;

interface MyClassesProps {
    showSnackBar: ShowSnackBar;
    theme: {
        theme: 'light' | 'dark';
        color: {
            '100': string;
            '200': string;
            '500': string;
        };
    };
    isTeacher: boolean;
    classToJumpTo: number | null;
    setToJumpTo: number | null;
    startTest: (test: Http.GetClasses_Test) => void;
    postTest: (id: number) => void;
}

interface MyClassesState {
    classes: (Http.GetClasses_Class & {open?: boolean})[];
    classesLoaded: boolean;
    apexChartEl: undefined | ReactElement;
    c: null | number;
    t: null | number;
    enrollErrorMessage: string;
    activeTab: number;
    testStats: null | Http.TestStats;
    testStatsIdx: undefined;
    testStatsDataSelectIdx: number;
    testStatsDataQuestionIdx: number;
    joinClassPopperOpen: boolean;
    joinClassPopperIdx: 0 | 1;
    enrollObj: Http.Enroll;
}

export default class MyClasses extends Component<MyClassesProps, MyClassesState> {
    constructor(props: MyClassesProps) {
        super(props);
        this.state = {
            classes: [],
            classesLoaded: false,
            apexChartEl: undefined,
            c: null, // Selected class
            t: null, // Selected test
            enrollErrorMessage: '',
            activeTab: 0,
            testStats: null,
            testStatsIdx: undefined,
            testStatsDataSelectIdx: 3,
            testStatsDataQuestionIdx: 0,
            joinClassPopperOpen: false,
            joinClassPopperIdx: 0,
            enrollObj: {
                message: undefined,
                classID: 0,
                price: 0,
                discount: 0,
                tax: 0,
                totalPrice: 0,
                freeTrial: false,
            },
        };
    }

    componentDidMount() {
        this.loadClasses();
        if (this.props.isTeacher) {
            // if it's a teacher account
            this.props.showSnackBar(
                'info',
                'Only student account attempts are considered in the analytics',
                2000,
            );
        }
    }

    tryToJump() {
        if (this.props.classToJumpTo != null) {
            const classToJumpTo = this.state.classes.findIndex(
                c => c.classID === this.props.classToJumpTo,
            );
            if (classToJumpTo !== -1) {
                this.selectClass(classToJumpTo);
                this.handleClassListItemClick();
            }
            if (this.props.setToJumpTo != null) {
                const setToJumpTo = this.state.classes[this.state.c as number].tests.findIndex(
                    test => test.testID === this.props.setToJumpTo,
                );
                if (setToJumpTo !== -1) {
                    this.getTestStats(this.props.setToJumpTo, classToJumpTo, setToJumpTo);
                }
            }
        }
    }
    loadClasses(alertMessage?: string) {
        /* Loads the classes into the state */
        Http.getClasses(
            result => {
                this.setState({
                    classes: result.classes,
                    classesLoaded: true,
                });
                this.tryToJump();
            },
            result => {
                console.log(result);
            },
        );
        if (alertMessage !== undefined) {
            this.props.showSnackBar('success', alertMessage, 2000);
        }
    }

    render() {
        return (
            <div className='avo-user__background' style={{width: '100%', flex: 1, display: 'flex'}}>
                <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                    <div style={{flex: 3, display: 'flex'}}>{this.sideMenu()}</div>
                    {/* Border From Menu To Main*/}
                    <div style={{flex: 1}} />
                    {/* Right hand side cards, see detailsCard() */}
                    <div style={{flex: 7, display: 'flex'}}>
                        <Card
                            className='avo-card'
                            style={{
                                marginBottom: '10%',
                                padding: '10px',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {this.detailsCard()}
                        </Card>
                    </div>
                    <div style={{flex: 1}} />
                </div>
                {this.enrollInClassPopper()} {/* This manages the enroll in classes button */}
            </div>
        );
    }

    sideMenu() {
        // This is the side menu where students can select the class that they are in
        return (
            <Paper
                classes={{root: 'avo-sidebar'}}
                square
                style={{width: '100%', flex: 1, display: 'flex'}}
            >
                <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                    <Typography
                        variant='subtitle1'
                        color='textPrimary'
                        style={{textAlign: 'center'}}
                    >
                        Welcome to My Classes
                    </Typography>
                    <br />
                    <Divider />
                    <ListSubheader style={{position: 'relative'}}>Class Enrollment</ListSubheader>
                    {/*<ListItem button disabled>*/}
                    {/*<BarChartOutlinedIcon color='action'/>*/}
                    {/*<ListItemText inset primary='My Analytics'/>*/}
                    {/*</ListItem>*/}
                    <ListItem
                        button
                        id='avo-myclasses__enroll-button'
                        onClick={() =>
                            this.setState({joinClassPopperOpen: true, joinClassPopperIdx: 0})
                        }
                    >
                        <AddBoxOutlinedIcon color='action' />
                        <ListItemText inset primary='Enroll in Class' />
                    </ListItem>
                    <Divider />
                    <ListSubheader style={{position: 'relative'}}>Classes</ListSubheader>
                    {!this.state.classesLoaded ? (
                        <Fragment>
                            <div
                                className='avo-loading-icon'
                                style={{color: `${this.props.theme.color['500']}`}}
                            />
                            <br />
                            <div style={{textAlign: 'center'}}>
                                <Typography
                                    component={'span'}
                                    variant='body1'
                                    color='textPrimary'
                                    classes={{root: 'avo-padding__16px'}}
                                >
                                    Loading your class data...
                                </Typography>
                            </div>
                        </Fragment>
                    ) : (
                        this.state.classes.map((cls, cIndex) => (
                            <Fragment key={'MyClasses' + cls.classID + '-' + cIndex}>
                                <ListItem
                                    button
                                    onClick={() => {
                                        this.selectClass(cIndex);
                                        this.handleClassListItemClick();
                                    }}
                                >
                                    <PeopleOutlinedIcon color='action' />
                                    <ListItemText inset primary={cls.name} />
                                    {cls.open ? (
                                        <ExpandLess
                                            color={cls.tests.length === 0 ? 'disabled' : 'action'}
                                        />
                                    ) : (
                                        <ExpandMore
                                            color={cls.tests.length === 0 ? 'disabled' : 'action'}
                                        />
                                    )}
                                </ListItem>
                                <Collapse in={cls.open} timeout='auto' unmountOnExit>
                                    <List>
                                        {cls.tests.map((test, tIndex) => (
                                            <ListItem
                                                key={
                                                    'MyClasses' +
                                                    cls.classID +
                                                    '-' +
                                                    cIndex +
                                                    '-' +
                                                    test.testID +
                                                    '-' +
                                                    tIndex
                                                }
                                                button
                                                onClick={() => {
                                                    this.getTestStats(test.testID, cIndex, tIndex);
                                                }}
                                            >
                                                <AssessmentOutlinedIcon
                                                    color={test.open ? 'primary' : 'disabled'}
                                                    style={{marginLeft: '10px'}}
                                                />
                                                <ListItemText inset primary={test.name} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </Fragment>
                        ))
                    )}
                </List>
            </Paper>
        );
    }

    selectClass(index: number) {
        let newClassList = copy(this.state.classes);
        if (newClassList[index].tests.length > 0)
            newClassList[index].open = !newClassList[index].open;
        this.setState({classes: newClassList, c: index, t: null});
    }

    enrollInClassPopper() {
        return (
            <Popper
                placement='right-start'
                open={this.state.joinClassPopperOpen}
                anchorEl={() =>
                    document.getElementById('avo-myclasses__enroll-button') as HTMLElement
                }
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
                <Paper style={{marginLeft: '10em', padding: '10px', height: 'auto'}}>
                    {this.state.joinClassPopperIdx === CONST_ENROLL_TAB && (
                        <Fragment>
                            <Typography component={'span'} variant='body1' color='textPrimary'>
                                Please enter the course code for the class you want to enroll in.
                            </Typography>
                            <TextField
                                id='avo-myclasses__enroll-textfield'
                                margin='normal'
                                style={{width: '60%'}}
                                label='Course code'
                                helperText={this.state.enrollErrorMessage + ' '}
                                error={this.state.enrollErrorMessage !== ''}
                            />
                            <br />
                            <Button color='primary' onClick={() => this.enrollButton()}>
                                Enroll
                            </Button>
                            <Button
                                color='primary'
                                onClick={() => this.setState({joinClassPopperOpen: false})}
                            >
                                Close
                            </Button>
                        </Fragment>
                    )}
                    {this.state.joinClassPopperIdx === CONST_PAYMENT_TAB && (
                        <Fragment>
                            <Typography
                                component={'span'}
                                variant='h4'
                                color='primary'
                                classes={{root: 'avo-padding__16px'}}
                            >
                                Course code is valid.
                            </Typography>
                            <Typography
                                component={'span'}
                                variant='body1'
                                color='textPrimary'
                                classes={{root: 'avo-padding__16px'}}
                            >
                                To confirm your selection please pay via PayPal.
                            </Typography>
                            <br />
                            {!this.state.enrollObj.message &&
                                MyClasses.enrollInClass_priceDisplay(
                                    this.state.enrollObj.price,
                                    this.state.enrollObj.discount,
                                    this.state.enrollObj.tax,
                                )}
                            <br />
                            <Divider />
                            <br />
                            <Typography
                                component={'span'}
                                variant='body1'
                                color='textPrimary'
                                classes={{root: 'avo-padding__16px'}}
                                style={{textAlign: 'center'}}
                            >
                                <div id='paypal-button' />
                                <br />
                                {!this.state.enrollObj.message && this.state.enrollObj.freeTrial && (
                                    <a
                                        style={{
                                            color: this.props.theme.color['500'],
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            if (!this.state.enrollObj.message)
                                                Http.freeTrial(
                                                    this.state.enrollObj.classID,
                                                    () => {
                                                        this.setState({joinClassPopperOpen: false});
                                                        this.loadClasses(
                                                            'Successfully enrolled in the class!',
                                                        );
                                                    },
                                                    () => {},
                                                );
                                        }}
                                    >
                                        14 day free trial
                                    </a>
                                )}
                                <br />
                            </Typography>
                            <Button
                                color='primary'
                                onClick={() => {
                                    this.setState({joinClassPopperOpen: false});
                                }}
                            >
                                Close
                            </Button>
                        </Fragment>
                    )}
                </Paper>
            </Popper>
        );
    }

    enrollButton() {
        const key = (document.getElementById('avo-myclasses__enroll-textfield') as HTMLInputElement)
            .value;
        if (key !== null && key !== '') {
            Http.enroll(
                key,
                result => {
                    console.log(result);
                    if (result.message === 'enrolled') {
                        this.setState({enrollErrorMessage: '', joinClassPopperOpen: false});
                        this.loadClasses('Successfully enrolled in the class!');
                        return;
                    }
                    this.setState({
                        enrollErrorMessage: '',
                        joinClassPopperIdx: 1,
                        enrollObj: result,
                    });
                    // noinspection ES6ConvertVarToLetConst
                    var _this = this;
                    setTimeout(() => {
                        // noinspection JSUnusedGlobalSymbols, JSUnresolvedVariable
                        paypal.Button.render(
                            {
                                env: PAYPAL_MODE,
                                commit: true,
                                payment: () => {
                                    // noinspection JSUnresolvedFunction
                                    return paypal
                                        .request({
                                            method: 'post',
                                            url: 'pay',
                                            json: {
                                                classID: result.classID,
                                            },
                                        })
                                        .then((data: {tid: string}) => data.tid);
                                },
                                onAuthorize: (data: {paymentID: string; payerID: string}) => {
                                    // noinspection JSUnresolvedFunction
                                    return paypal
                                        .request({
                                            method: 'post',
                                            url: '/postPay',
                                            json: {
                                                tid: data.paymentID,
                                                payerID: data.payerID,
                                            },
                                        })
                                        .then((data: any) => {
                                            console.log(data);
                                            _this.setState({
                                                enrollErrorMessage: '',
                                                joinClassPopperOpen: false,
                                            });
                                            _this.loadClasses(
                                                'Successfully enrolled in the class!',
                                            );
                                        })
                                        .catch(function() {
                                            alert('error');
                                        });
                                },
                            },
                            '#paypal-button',
                        );
                    }, 250);
                },
                () =>
                    this.setState({
                        enrollErrorMessage: 'Invalid code',
                    }),
            );
        } else
            this.setState({
                enrollErrorMessage: 'Field cannot be blank. Please enter a code to join a class.',
            });
    }

    static enrollInClass_priceDisplay(price: number, discountPrice: number, tax: number) {
        // Displays the price and the discounted price. If price and discounted price is the same then we only show price
        // tax is the amount of money
        if (price !== discountPrice)
            return (
                <Fragment>
                    <s>
                        <Typography
                            component={'span'}
                            variant='body1'
                            color='textPrimary'
                            classes={{root: 'avo-padding__16px'}}
                        >
                            Standard Price: ${price}
                        </Typography>
                    </s>
                    <br />
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Discounted Price: ${discountPrice}
                    </Typography>
                    <br />
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Tax: ${tax}
                    </Typography>
                    <br />
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Total: ${(discountPrice + tax).toFixed(2)}
                    </Typography>
                </Fragment>
            );
        else
            return (
                <Fragment>
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Price: ${discountPrice}
                    </Typography>
                    <br />
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Tax: ${tax}
                    </Typography>
                    <br />
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Total: ${(discountPrice + tax).toFixed(2)}
                    </Typography>
                </Fragment>
            );
    }

    detailsCard() {
        let selectedClass = this.state.classes[this.state.c as number];
        const testStats = this.state.testStats as Http.TestStats;
        // Class with tests
        if (this.state.t != null) {
            let selectedTest = selectedClass.tests[this.state.t];
            let bestMark = 0;
            for (let i = 0; i < selectedTest.submitted.length; i++) {
                if (selectedTest.submitted[i].grade > bestMark)
                    bestMark = selectedTest.submitted[i].grade;
            }
            bestMark = (bestMark / selectedTest.total) * 100;
            const analyticsDataObj = convertListFloatToAnalytics(
                testStats.topMarkPerStudent,
                testStats.totalMark as number,
            );
            let disableStartTest = !selectedTest.open;
            return (
                <Fragment>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant='h6'> {selectedTest.name}</Typography>
                        <Button
                            color='primary'
                            classes={{
                                root: 'avo-card__header-button',
                                disabled: 'disabled',
                            }}
                            onClick={() => this.props.startTest(selectedTest)}
                            disabled={disableStartTest}
                        >
                            {selectedTest.current === null ? 'Start Test' : 'Resume Test'}
                        </Button>
                    </div>
                    <br />
                    {MyClasses.detailsCard_infoAboutTest(selectedTest)}{' '}
                    {/* Display the test attempt, due date, ...etc */}
                    <br />
                    {this.detailsCard_tabs(bestMark, analyticsDataObj, selectedClass, selectedTest)}
                </Fragment>
            );
        }
        // Class with no tests
        else if (this.state.c !== null)
            return (
                <Fragment>
                    <CardHeader
                        classes={{
                            root: 'avo-card__header',
                        }}
                        title={selectedClass.name}
                    />
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        {selectedClass.tests.length === 0 &&
                            "This class doesn't have any tests or assignments yet!"}
                    </Typography>
                    <div className='mixed-chart' id='avo-apex__chart-container'>
                        {selectedClass.tests.length !== 0 ? ( // if there is at least one test then display data
                            <Fragment>
                                {this.state.apexChartEl}
                                <Typography
                                    component={'span'}
                                    variant='body1'
                                    color='textPrimary'
                                    classes={{root: 'avo-padding__16px'}}
                                >
                                    Average: Based on the average of the best attempts of each
                                    student who took the test or assignment.
                                </Typography>
                                <Typography
                                    component={'span'}
                                    variant='body1'
                                    color='textPrimary'
                                    classes={{root: 'avo-padding__16px'}}
                                >
                                    Size: The number of students who has taken the test or
                                    assignment.
                                </Typography>
                            </Fragment>
                        ) : null}
                    </div>
                </Fragment>
            );
        // No classes or tests
        else
            return (
                <Fragment>
                    <CardHeader classes={{root: 'avo-card__header'}} title={'Hey there!'} />
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        Looks like you haven't selected a Class or Test yet!
                    </Typography>
                    <br />
                </Fragment>
            );
    }

    static detailsCard_infoAboutTest(selectedTest: Http.GetClasses_Test) {
        return (
            <div style={{textAlign: 'center'}}>
                <Typography component={'span'} variant='body1' color='textPrimary'>
                    <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                        <b>Deadline:</b> {getDateString(selectedTest.deadline)}
                    </span>
                    <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                        <b>Time Limit:</b>{' '}
                        {selectedTest.timer === -1
                            ? ' None'
                            : ' ' + selectedTest.timer + ' minutes'}
                    </span>
                    <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                        <b>Attempts:</b>{' '}
                        {selectedTest.attempts === -1 ? ' Unlimited' : ' ' + selectedTest.attempts}
                    </span>
                </Typography>
            </div>
        );
    }

    detailsCard_tabs(
        bestMark: number,
        analyticsDataObj: any,
        selectedClass: Http.GetClasses_Class,
        selectedTest: Http.GetClasses_Test,
    ) {
        // this is the information that is displayed under each tab
        const {activeTab} = this.state;
        return (
            <Fragment>
                <Tabs
                    value={this.state.activeTab}
                    onChange={this.handleTabViewChange.bind(this)}
                    indicatorColor='primary'
                    textColor='primary'
                >
                    <Tab label='Overall Analytics' />
                    <Tab label='Per Question Analytics' />
                    <Tab label='My Attempts' />
                </Tabs>
                {activeTab === CONST_TAB_OVERALL_ANALYTICS
                    ? this.detailsCard_overallAnalytics(bestMark, analyticsDataObj)
                    : activeTab === CONST_TAB_PER_QUESTION
                    ? this.detailsCard_perQuestion(bestMark, analyticsDataObj)
                    : activeTab === CONST_TAB_MY_ATTEMPTS
                    ? this.detailsCard_myAttempts(
                          bestMark,
                          analyticsDataObj,
                          selectedClass,
                          selectedTest,
                      )
                    : null}
            </Fragment>
        );
    }

    detailsCard_overallAnalytics(bestMark: number, analyticsDataObj: any) {
        if (!this.state.testStats) {
            throw new Error();
        }
        return (
            <div style={{overflowY: 'auto', overflowX: 'hidden', textAlign: 'center'}}>
                <br />
                <Typography component={'span'} variant='body1' color='textPrimary'>
                    <span>
                        <span
                            style={{
                                marginLeft: '0.75em',
                                marginRight: '0.75em',
                            }}
                        >
                            <b>Students:</b> {analyticsDataObj.studentSizeWhoTookIt}
                        </span>
                        <span
                            style={{
                                marginLeft: '0.75em',
                                marginRight: '0.75em',
                            }}
                        >
                            <b>Median Scores:</b> {this.state.testStats.testMedian}
                        </span>
                        <span
                            style={{
                                marginLeft: '0.75em',
                                marginRight: '0.75em',
                            }}
                        >
                            <b>Mean Scores:</b> {this.state.testStats.testMean}
                        </span>
                        <span
                            style={{
                                marginLeft: '0.75em',
                                marginRight: '0.75em',
                            }}
                        >
                            <b>Std. Dev:</b> {this.state.testStats.testSTDEV}%
                        </span>
                        <span
                            style={{
                                marginLeft: '0.75em',
                                marginRight: '0.75em',
                            }}
                        >
                            <b>My Best Attempt:</b>{' '}
                            {Math.round(
                                (bestMark / 100) * (this.state.testStats.totalMark as number),
                            )}
                        </span>
                    </span>
                </Typography>
                <br />
                <Chart
                    options={this.getTestCardGraphOptions()}
                    series={this.getTestCardGraphSeries()}
                    type='line'
                    width='100%'
                />
            </div>
        );
    }

    detailsCard_perQuestion(bestMark: number, analyticsDataObj: any) {
        if (!this.state.testStats) {
            return null;
        }
        return (
            <div style={{overflowY: 'auto', overflowX: 'hidden', textAlign: 'center'}}>
                <br />
                <Typography component={'span'} variant='body1' color='textPrimary'>
                    <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                        <FormControl>
                            {/*<InputLabel htmlFor="test-stats__data-display">Question to display</InputLabel>*/}
                            <Select
                                value={this.state.testStatsDataQuestionIdx}
                                onChange={e =>
                                    this.setState({
                                        testStatsDataQuestionIdx: Number(e.target.value),
                                    })
                                }
                                input={<Input name='dataSelected' id='test-stats__data-display' />}
                            >
                                {this.state.testStats.questions.map((obj, idx) => (
                                    <MenuItem
                                        value={idx}
                                        key={'QuestionStats' + idx}
                                    >{`Question ${idx + 1}`}</MenuItem>
                                ))}
                            </Select>
                            {/*<FormHelperText>Select the data to be displayed</FormHelperText>*/}
                        </FormControl>
                    </span>
                    <span
                        style={{
                            marginLeft: '1.0em',
                            marginRight: '1.0em',
                        }}
                    >
                        <b>Students:</b>
                        {analyticsDataObj.studentSizeWhoTookIt}
                    </span>
                    <span
                        style={{
                            marginLeft: '1.0em',
                            marginRight: '1.0em',
                        }}
                    >
                        <b>Median Score:</b>
                        {
                            this.state.testStats.questions[this.state.testStatsDataQuestionIdx]
                                .questionMedian
                        }
                    </span>
                    <span
                        style={{
                            marginLeft: '1.0em',
                            marginRight: '1.0em',
                        }}
                    >
                        <b>Mean Score:</b>
                        {
                            this.state.testStats.questions[this.state.testStatsDataQuestionIdx]
                                .questionMean
                        }
                    </span>
                    <span
                        style={{
                            marginLeft: '1.0em',
                            marginRight: '1.0em',
                        }}
                    >
                        <b>Std. Dev:</b>
                        {(this.state.testStats.questions[this.state.testStatsDataQuestionIdx]
                            .questionSTDEV as number).toFixed(2)}
                        %
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

    detailsCard_myAttempts(
        bestMark: number,
        analyticsDataObj: any,
        selectedClass: Http.GetClasses_Class,
        selectedTest: Http.GetClasses_Test,
    ) {
        return (
            <Fragment>
                <br />
                <List style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
                    {selectedTest.submitted.map((x, y) => (
                        <ListItem key={'MyClasses:' + x.takesID + ', ' + y}>
                            <ListItemText
                                primary={
                                    'Attempt ' +
                                    (y + 1) +
                                    ' - ' +
                                    x.grade +
                                    '/' +
                                    selectedTest.total
                                }
                                secondary={'Submitted on ' + getDateString(x.timeSubmitted)}
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title='View previous test results'>
                                    <IconButton
                                        onClick={() => {
                                            this.props.postTest(x.takesID);
                                        }}
                                    >
                                        <DescriptionOutlinedIcon />
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Fragment>
        );
    }

    getPerQuestionGraphOptions() {
        if (!this.state.testStats) {
            throw new Error();
        }
        let dataObj = convertListFloatToAnalytics(
            this.state.testStats.questions[this.state.testStatsDataQuestionIdx]
                .topMarksPerStudent as number[],
            this.state.testStats.questions[this.state.testStatsDataQuestionIdx].totalMark as number,
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
                    if (dataObj.hasOwnProperty(key) && key !== 'studentSizeWhoTookIt')
                        dataOutArray.push(key);
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
                max: dataObj.studentSizeWhoTookIt,
                tickAmount: dataObj.studentSizeWhoTookIt >= 10 ? 10 : dataObj.studentSizeWhoTookIt,
            },
            fill: {
                opacity: 1,
                type: 'solid',
                colors: [
                    this.props.theme.color['500'],
                    this.props.theme.color['200'],
                    this.props.theme.color['100'],
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
                    colors:
                        this.props.theme.theme === 'light'
                            ? ['#000000', '#000000', '#000000']
                            : ['#ffffff', '#ffffff', '#ffffff'],
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
        if (!this.state.testStats) {
            throw new Error();
        }
        let dataObj = convertListFloatToAnalytics(
            this.state.testStats.questions[this.state.testStatsDataQuestionIdx]
                .topMarksPerStudent as number[],
            this.state.testStats.questions[this.state.testStatsDataQuestionIdx].totalMark as number,
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
        if (!this.state.testStats) {
            throw new Error();
        }
        let selectedTest = this.state.classes[this.state.c as number].tests[this.state.t as number];
        return {
            chart: {
                fontFamily: 'Roboto',
                foreColor: this.props.theme.theme === 'light' ? '#000000' : '#ffffff',
                id: 'basic-bar',
                type: 'line',
            },
            colors: [
                this.props.theme.color['500'],
                this.props.theme.color['200'],
                this.props.theme.color['100'],
            ],
            stroke: {
                curve: 'smooth',
            },
            labels:
                this.state.testStatsDataSelectIdx === 2 && selectedTest.submitted.length > 0
                    ? selectedTest.submitted.map((obj, idx) => 'Attempt ' + (idx + 1))
                    : this.state.testStatsDataSelectIdx === 3
                    ? (() => {
                          const dataObj = convertListFloatToAnalytics(
                              this.state.testStats.topMarkPerStudent,
                              this.state.testStats.totalMark as number,
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
                        ? convertListFloatToAnalytics(this.state.testStats.topMarkPerStudent, this
                              .state.testStats.totalMark as number).studentSizeWhoTookIt
                        : 100,
                tickAmount: Math.min(
                    convertListFloatToAnalytics(this.state.testStats.topMarkPerStudent, this.state
                        .testStats.totalMark as number).studentSizeWhoTookIt as number,
                    10,
                ),
            },
            fill: {
                opacity: 1,
                type: 'solid',
                colors: [
                    this.props.theme.color['500'],
                    this.props.theme.color['200'],
                    this.props.theme.color['100'],
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
                    colors:
                        this.props.theme.theme === 'light'
                            ? ['#000000', '#000000', '#000000']
                            : ['#ffffff', '#ffffff', '#ffffff'],
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
        if (!this.state.testStats) {
            throw new Error();
        }
        const testStats: Http.TestStats = this.state.testStats;
        let selectedTest = this.state.classes[this.state.c as number].tests[this.state.t as number];
        if (this.state.testStatsDataSelectIdx === 0) {
            let testAverage = 0;
            selectedTest.submitted.forEach(obj => {
                testAverage += obj.grade;
            });
            if (testAverage !== 0) {
                testAverage =
                    (testAverage / (selectedTest.total * selectedTest.submitted.length)) * 100;
            }
            return [
                {
                    name: 'Test Mean',
                    type: 'column',
                    data: ['', testStats.testMean, ''],
                },
                {
                    name: 'Test Median',
                    type: 'column',
                    data: ['', testStats.testMedian, ''],
                },
                {
                    name: 'My Average',
                    type: 'column',
                    data: ['', testAverage, ''],
                },
                {
                    name: 'Test SD',
                    type: 'line',
                    data: ['', testStats.testSTDEV, ''],
                },
            ];
        } else if (this.state.testStatsDataSelectIdx === 1) {
            let myBestMark = 0;
            selectedTest.submitted.forEach(obj => {
                myBestMark = obj.grade > myBestMark ? obj.grade : myBestMark;
            });
            myBestMark = (myBestMark / selectedTest.total) * 100;
            return [
                {
                    name: 'Test Mean',
                    type: 'column',
                    data: ['', testStats.testMean, ''],
                },
                {
                    name: 'Test Median',
                    type: 'column',
                    data: ['', testStats.testMedian, ''],
                },
                {
                    name: 'My Best Attempt',
                    type: 'column',
                    data: ['', myBestMark, ''],
                },
                {
                    name: 'Test SD',
                    type: 'line',
                    data: ['', testStats.testSTDEV, ''],
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
                    meanArray.push(testStats.testMean);
                    medianArray.push(testStats.testMedian);
                    sdArray.push(testStats.testSTDEV);
                });
            } else {
                attemptArray = ['', 'No Attempts Available', ''];
                meanArray = ['', testStats.testMean, ''];
                medianArray = ['', testStats.testMedian, ''];
                sdArray = ['', testStats.testSTDEV, ''];
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
        } else if (this.state.testStatsDataSelectIdx === CONST_OVERALL_ANALYTICS_DEFAULT) {
            // this is the default value
            const dataObj = convertListFloatToAnalytics(
                testStats.topMarkPerStudent,
                testStats.totalMark as number,
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
        return null;
    }

    handleTabViewChange(event: any, value: number) {
        this.setState({activeTab: value});
    }

    getTestStats(testID: number, cIndex: number, tIndex: number) {
        Http.testStats(
            testID,
            result => this.setState({c: cIndex, t: tIndex, testStats: result}),
            err => console.log(err),
        );
    }

    handleClassListItemClick() {
        setTimeout(() => {
            let container = document.getElementById('avo-apex__chart-container');
            if (container === null) return;
            this.setState({
                apexChartEl: (
                    <Chart
                        options={this.generateChartOptions()}
                        series={this.processClassChartData()}
                        type='line'
                        width={container.clientWidth}
                    />
                ),
            });
            window.onresize = this.handleResize.bind(this);
        }, 50);
    }

    handleResize() {
        let container = document.getElementById('avo-apex__chart-container');
        if (container === null) return;
        this.setState({
            apexChartEl: (
                <Chart
                    options={this.generateChartOptions()}
                    series={this.processClassChartData()}
                    type='line'
                    width={container.clientWidth}
                />
            ),
        });
    }

    processClassChartData() {
        let selectedClass = this.state.classes[this.state.c as number];
        let classAvg = [];
        let myMark = [];
        let standardDev = [];
        for (let i = 0; i < selectedClass.tests.length; i++) {
            const testObj = selectedClass.tests[i];
            classAvg.push(testObj.classAverage.toFixed(2));
            standardDev.push(testObj.standardDeviation.toFixed(2));
            let myAvg = -1;
            for (let j = 0; j < testObj.submitted.length; j++) {
                let takeObj = testObj.submitted[j];
                myAvg = takeObj.grade > myAvg ? takeObj.grade : myAvg;
            }
            if (testObj.submitted.length > 0) {
                myAvg = (myAvg / testObj.total) * 100;
                myMark.push(myAvg.toFixed(2));
            } else {
                myMark.push('Test or Assignment has not been taken');
            }
        }
        return [
            {
                name: 'My Best Attempt (%)',
                type: 'column',
                data: myMark,
            },
            {
                name: 'Class Average (%)',
                type: 'column',
                data: classAvg,
            },
            {
                name: 'SD for Class Avg (%)',
                type: 'column',
                data: standardDev,
            },
        ];
    }

    generateChartOptions() {
        let selectedClass = this.state.classes[this.state.c as number];
        let xCategories = [];
        for (let i = 0; i < selectedClass.tests.length; i++) {
            xCategories.push(selectedClass.tests[i].name);
        }
        return {
            chart: {
                fontFamily: 'Roboto',
                foreColor: this.props.theme.theme === 'light' ? '#000000' : '#ffffff',
                id: 'basic-bar',
                type: 'line',
            },
            colors: [
                this.props.theme.color['500'],
                this.props.theme.color['200'],
                this.props.theme.color['100'],
            ],
            xaxis: {
                labels: {
                    formatter: (val: string) => {
                        for (let i = 0; i < selectedClass.tests.length; i++) {
                            if (selectedClass.tests[i].name === val) {
                                return `${val} (size: ${selectedClass.tests[i].classSize})`;
                            }
                        }
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
                opacity: 1,
                type: 'solid',
                colors: [
                    this.props.theme.color['500'],
                    this.props.theme.color['200'],
                    this.props.theme.color['100'],
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
                    colors:
                        this.props.theme.theme === 'light'
                            ? ['#000000', '#000000', '#000000']
                            : ['#ffffff', '#ffffff', '#ffffff'],
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