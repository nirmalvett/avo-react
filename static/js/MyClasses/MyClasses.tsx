import React, {Component, Fragment} from 'react';
import {
    Button,
    Collapse,
    Divider,
    FormControl,
    IconButton,
    Input,
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
    DescriptionOutlined,
    ExpandLess,
    ExpandMore,
    PeopleOutlined,
} from '@material-ui/icons';
import * as Http from '../Http';
import {getDateString} from '../HelperFunctions/Utilities';
import {convertListFloatToAnalytics} from '../HelperFunctions/Helpers';
import {ShowSnackBar} from '../Layout/Layout';
import {
    generateChartOptions,
    getTestCardGraphOptions,
    getPerQuestionGraphOptions,
} from './chartOptions';
// @ts-ignore
import Chart from 'react-apexcharts';
// @ts-ignore
import paypal from 'paypal-checkout';
// @ts-ignore
import paypal_mode from 'js-yaml-loader!../../../config.yaml';
import {GetSections_Test} from "../Http";

const CONST_TAB_OVERALL_ANALYTICS = 0;
const CONST_TAB_PER_QUESTION = 1;
const CONST_TAB_MY_ATTEMPTS = 2;

const CONST_ENROLL_TAB = 0;
const CONST_PAYMENT_TAB = 1;

const CONST_OVERALL_ANALYTICS_DEFAULT = 3;
// noinspection JSUnresolvedVariable
let PAYPAL_MODE = JSON.parse(paypal_mode.slice(18, -2)).paypal_mode;

interface MyClassesProps {
    sections: Http.GetSections_Section[];
    updateSections: (sections: Http.GetSections_Section[], cb?: () => void) => void;
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
    startTest: (test: Http.GetSections_Test) => void;
    postTest: (id: number) => void;
}

interface MyClassesState {
    now: number;
    open: {[sectionID: number]: boolean};
    chartWidth: number;
    c: null | number;
    t: null | number;
    enrollErrorMessage: string;
    activeTab: number;
    testStats: null | Http.TestStats;
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
            now: Number(new Date()),
            open: {},
            chartWidth: 200,
            c: null, // Selected class
            t: null, // Selected test
            enrollErrorMessage: '',
            activeTab: 0,
            testStats: null,
            testStatsDataSelectIdx: 3,
            testStatsDataQuestionIdx: 0,
            joinClassPopperOpen: false,
            joinClassPopperIdx: 0,
            enrollObj: {
                message: undefined,
                sectionID: 0,
                price: 0,
                discount: 0,
                tax: 0,
                totalPrice: 0,
                freeTrial: false,
            },
        };
    }

    componentDidMount() {
        this.handleResize();
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
            const classToJumpTo = this.props.sections.findIndex(
                c => c.sectionID === this.props.classToJumpTo,
            );
            if (classToJumpTo !== -1) {
                this.selectClass(classToJumpTo);
            }
            if (this.props.setToJumpTo != null) {
                const setToJumpTo = this.selectedClass().tests.findIndex(
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
        Http.getSections(
            result => {
                this.props.updateSections(result.sections);
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
                    <div style={{flex: 4, display: 'flex'}}>{this.sideMenu()}</div>
                    {/* Border From Menu To Main*/}
                    <div style={{flex: 1}} />
                    {/* Right hand side cards, see detailsCard() */}
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
                <List style={{flex: 1, overflowY: 'auto', paddingTop: 0}}>
                    <ListSubheader style={{position: 'relative'}}>Section Enrollment</ListSubheader>
                    <ListItem
                        button
                        id='avo-myclasses__enroll-button'
                        onClick={() =>
                            this.setState({joinClassPopperOpen: true, joinClassPopperIdx: 0})
                        }
                    >
                        <ListItemIcon>
                            <AddBoxOutlined color='action' />
                        </ListItemIcon>
                        <ListItemText primary='Enroll in Section' />
                    </ListItem>
                    <Divider />
                    <ListSubheader style={{position: 'relative'}}>Sections</ListSubheader>
                    {this.props.sections.map((cls, cIndex) => (
                        <Fragment key={'MyClasses' + cls.sectionID + '-' + cIndex}>
                            <ListItem
                                button
                                onClick={() => {
                                    this.selectClass(cIndex);
                                }}
                            >
                                <ListItemIcon>
                                    <PeopleOutlined color='action' />
                                </ListItemIcon>
                                <ListItemText primary={cls.name} />
                                {this.state.open[cls.sectionID] ? (
                                    <ExpandLess
                                        color={cls.tests.length === 0 ? 'disabled' : 'action'}
                                    />
                                ) : (
                                    <ExpandMore
                                        color={cls.tests.length === 0 ? 'disabled' : 'action'}
                                    />
                                )}
                            </ListItem>
                            <Collapse
                                in={this.state.open[cls.sectionID]}
                                timeout='auto'
                                unmountOnExit
                            >
                                <List>
                                    {cls.tests.map((test, tIndex) => (
                                        <ListItem
                                            key={
                                                'MyClasses' +
                                                cls.sectionID +
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
                    ))}
                </List>
            </Paper>
        );
    }

    selectClass(index: number) {
        const open = {...this.state.open};
        if (this.props.sections[index].tests.length > 0)
            open[this.props.sections[index].sectionID] = !open[
                this.props.sections[index].sectionID
            ];
        this.setState({open, c: index, t: null});
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
                                Please enter the Enroll code for the Section you want to enroll in.
                            </Typography>
                            <TextField
                                id='avo-myclasses__enroll-textfield'
                                margin='normal'
                                style={{width: '60%'}}
                                label='Enroll code'
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
                                Enroll code is valid.
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
                                                    this.state.enrollObj.sectionID,
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
                                                classID: result.sectionID,
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
                                            this.setState({
                                                enrollErrorMessage: '',
                                                joinClassPopperOpen: false,
                                            });
                                            this.loadClasses('Successfully enrolled in the class!');
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
                e => this.setState({enrollErrorMessage: e.error}),
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
        let selectedClass = this.selectedClass();
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
            let disableStartTest = !isOpen(selectedTest, this.state.now);
            return (
                <Fragment>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}
                    >
                        <Typography variant='h5' color='textPrimary' style={{paddingLeft: '8px'}}>
                            {selectedTest.name}
                        </Typography>
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
                    <Typography
                        variant='h5'
                        color='textPrimary'
                        style={{paddingLeft: '8px', marginBottom: '16px'}}
                    >
                        {selectedClass.name}
                    </Typography>
                    <Typography
                        component={'span'}
                        variant='body1'
                        color='textPrimary'
                        classes={{root: 'avo-padding__16px'}}
                    >
                        {selectedClass.tests.length === 0 &&
                            "This Section doesn't have any tests or assignments yet!"}
                    </Typography>
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
                                    Average: Based on the average of the best attempts of each
                                    student who took the test or assignment.
                                </Typography>
                                <Typography
                                    component={'span'}
                                    variant='body2'
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
                    <Typography
                        variant='h5'
                        color='textPrimary'
                        style={{paddingLeft: '8px', marginBottom: '16px'}}
                    >
                        Hey there!
                    </Typography>
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

    static detailsCard_infoAboutTest(selectedTest: Http.GetSections_Test) {
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
        selectedClass: Http.GetSections_Section,
        selectedTest: Http.GetSections_Test,
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
                        <br />
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
                        <b>Median Score: </b>
                        {
                            this.state.testStats.questions[this.state.testStatsDataQuestionIdx]
                                .questionMedian
                        }
                    </span>
                    <br />
                    <span
                        style={{
                            marginLeft: '1.0em',
                            marginRight: '1.0em',
                        }}
                    >
                        <b>Mean Score: </b>
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
        selectedClass: Http.GetSections_Section,
        selectedTest: Http.GetSections_Test,
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
                                        <DescriptionOutlined />
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Fragment>
        );
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

    getTestCardGraphSeries() {
        if (!this.state.testStats) {
            throw new Error();
        }
        const testStats: Http.TestStats = this.state.testStats;
        let selectedTest = this.selectedTest();
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

    handleResize = () => {
        const container = document.getElementById('avo-apex__chart-container');
        if (container === null) return;
        this.setState({chartWidth: Math.floor(container.clientWidth - 32)});
    };

    processClassChartData() {
        let selectedClass = this.selectedClass();
        let classAvg = [];
        let myMark = [];
        let standardDev = [];
        for (let i = 0; i < selectedClass.tests.length; i++) {
            const testObj = selectedClass.tests[i];
            classAvg.push(testObj.sectionAverage.toFixed(2));
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
                name: 'Section Average (%)',
                type: 'column',
                data: classAvg,
            },
            {
                name: 'SD for Section Avg (%)',
                type: 'column',
                data: standardDev,
            },
        ];
    }

    selectedClass(): Http.GetSections_Section {
        return this.props.sections[this.state.c as number];
    }

    selectedTest(): Http.GetSections_Test {
        return this.selectedClass().tests[this.state.t as number];
    }

    generateChartOptions() {
        return generateChartOptions(this.selectedClass(), this.props.theme);
    }

    getTestCardGraphOptions() {
        return getTestCardGraphOptions(
            this.selectedTest(),
            this.state.testStats as Http.TestStats,
            this.props.theme,
            this.state.testStatsDataSelectIdx,
        );
    }

    getPerQuestionGraphOptions() {
        return getPerQuestionGraphOptions(
            this.state.testStats as Http.TestStats,
            this.state.testStatsDataQuestionIdx,
            this.state.testStatsDataSelectIdx,
            this.props.theme,
        );
    }
}

function isOpen(test: GetSections_Test, now: number) {
    return (
        (test.openTime === null || test.openTime < now) &&
        now < test.deadline &&
        (test.submitted.length < test.attempts || test.attempts === -1)
    );
}
