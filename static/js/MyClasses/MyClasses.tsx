import React, {Component, Fragment} from 'react';
import {Typography} from '@material-ui/core';
import * as Http from '../Http';
import {ShowSnackBar} from '../Layout/Layout';
import {Sidebar} from './Sidebar';
import {EnrollmentPopper} from './EnrollPopper/EnrollmentPopper';
import {ThemeObj} from '../Models';
import {SectionAnalytics} from './SectionAnalytics';
import {TestAnalytics} from './TestAnalytics/TestAnalytics';

interface MyClassesProps {
    sections: Http.GetSections_Section[];
    updateSections: (sections: Http.GetSections_Section[], cb?: () => void) => void;
    showSnackBar: ShowSnackBar;
    theme: ThemeObj;
    isTeacher: boolean;
    classToJumpTo: number | null;
    setToJumpTo: number | null;
    startTest: (test: Http.GetSections_Test) => void;
    postTest: (id: number) => void;
}

interface MyClassesState {
    mode:
        | {
        mode: null;
    }
        | {
        mode: 'section';
        s: Http.GetSections_Section;
    }
        | {
        mode: 'test';
        s: Http.GetSections_Section;
        t: Http.GetSections_Test;
        testStats: Http.TestStats;
    };
    now: number;
    chartWidth: number;
    joinClassPopperOpen: boolean;
}

export default class MyClasses extends Component<MyClassesProps, MyClassesState> {
    constructor(props: MyClassesProps) {
        super(props);
        this.state = {
            mode: {
                mode: null,
            },
            now: Number(new Date()),
            chartWidth: 200,
            joinClassPopperOpen: false,
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
        if (this.props.classToJumpTo) {
            if (this.props.setToJumpTo !== null) {
                this.clickTest(this.props.classToJumpTo, this.props.setToJumpTo);
            } else {
                this.clickSection(this.props.classToJumpTo);
            }
        }
    }

    loadClasses(alertMessage?: string) {
        /* Loads the classes into the state */
        Http.getSections(result => {
            this.props.updateSections(result.sections);
            this.tryToJump();
        }, console.warn);
        if (alertMessage) {
            this.props.showSnackBar('success', alertMessage, 2000);
        }
    }

    render() {
        return (
            <div className='avo-user__background' style={{width: '100%', flex: 1, display: 'flex'}}>
                <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
                    <div style={{flex: 4, display: 'flex'}}>{this.sideMenu()}</div>
                    {/* Border From Menu To Main*/}
                    <div style={{flex: 1}}/>
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
                    <div style={{flex: 1}}/>
                </div>
                <EnrollmentPopper
                    open={this.state.joinClassPopperOpen}
                    theme={this.props.theme}
                    onClose={() => this.setState({joinClassPopperOpen: false})}
                    onEnroll={() => {
                        this.setState({joinClassPopperOpen: false});
                        this.loadClasses('Successfully enrolled in the class!');
                    }}
                />
            </div>
        );
    }

    sectionByID(sectionID: number) {
        return this.props.sections.find(x => x.sectionID === sectionID) as Http.GetSections_Section;
    }

    clickSection = (sectionID: number) => () => {
        const section = this.sectionByID(sectionID);
        this.setState({mode: {mode: 'section', s: section}});
        Http.collectData(
            'click section my classes',
            {section},
            () => {
            },
            console.warn
        );
    };

    clickTest = (sectionID: number, testID: number) => () => {
        const s = this.sectionByID(sectionID);
        const t = s.tests.find(x => x.testID === testID) as Http.GetSections_Test;
        Http.collectData(
            'click test my classes',
            {test: t, section: s},
            () => {
            },
            console.warn
        );
        Http.testStats(
            testID,
            testStats => this.setState({mode: {mode: 'test', s, t, testStats}}),
            console.warn,
        );
    };

    sideMenu() {
        return (
            <Sidebar
                sections={this.props.sections}
                clickSection={this.clickSection}
                clickTest={this.clickTest}
                now={this.state.now}
                enroll={() => this.setState({joinClassPopperOpen: true})}
            />
        );
    }

    detailsCard() {
        // Class with tests
        if (this.state.mode.mode === 'test') {
            const {s, t, testStats} = this.state.mode;
            return (
                <TestAnalytics
                    section={s}
                    test={t}
                    testStats={testStats}
                    now={this.state.now}
                    startTest={() => this.props.startTest(t)}
                    postTest={(takesID: number) => () => this.props.postTest(takesID)}
                    theme={this.props.theme}
                />
            );
        }
        // Class with no tests
        else if (this.state.mode.mode === 'section') {
            return (
                <SectionAnalytics
                    section={this.state.mode.s}
                    chartWidth={this.state.chartWidth}
                    theme={this.props.theme}
                />
            );
        }
        // No classes or tests
        else {
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
                    <br/>
                </Fragment>
            );
        }
    }

    handleResize = () => {
        const container = document.getElementById('avo-apex__chart-container');
        if (container === null) return;
        this.setState({chartWidth: Math.floor(container.clientWidth - 32)});
    };
}
