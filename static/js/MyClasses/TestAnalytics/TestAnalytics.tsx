import React, {Component, Fragment} from 'react';
import {Button, Tab, Tabs, Typography} from '@material-ui/core';
import * as Http from '../../Http';
import {getDateString} from '../../HelperFunctions/Utilities';
import {ThemeObj} from '../../Models';
import {TestTab} from './TestTab';
import {QuestionTab} from './QuestionTab';
import {MyAttemptsTab} from './MyAttemptsTab';

interface TestAnalyticsProps {
    section: Http.GetSections_Section;
    test: Http.GetSections_Test;
    testStats: Http.TestStats;
    now: number;
    startTest: () => void;
    postTest: (takesID: number) => () => void;
    theme: ThemeObj;
}

interface TestAnalyticsState {
    mode: 'overall' | 'per question' | 'attempts';
    questionIndex: number;
}

export class TestAnalytics extends Component<TestAnalyticsProps, TestAnalyticsState> {
    constructor(props: TestAnalyticsProps) {
        super(props);
        this.state = {
            mode: 'overall',
            questionIndex: 0,
        };
    }

    render() {
        const {test} = this.props;
        const {mode} = this.state;
        let disableStartTest = !isOpen(test, this.props.now);
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
                        {test.name}
                    </Typography>
                    <Button
                        color='primary'
                        classes={{
                            root: 'avo-card__header-button',
                            disabled: 'disabled',
                        }}
                        onClick={this.props.startTest}
                        disabled={disableStartTest}
                    >
                        {test.current === null ? 'Start Test' : 'Resume Test'}
                    </Button>
                </div>
                <br />
                <div style={{textAlign: 'center'}}>
                    <Typography component={'span'} variant='body1' color='textPrimary'>
                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Deadline:</b> {getDateString(test.deadline)}
                        </span>
                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Time Limit:</b>
                            {test.timer === -1 ? ' None' : ' ' + test.timer + ' minutes'}
                        </span>
                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Attempts:</b>
                            {test.attempts === -1 ? ' Unlimited' : ' ' + test.attempts}
                        </span>
                    </Typography>
                </div>
                <br />
                <Tabs
                    value={mode}
                    onChange={(e, mode) => this.setState({mode})}
                    indicatorColor='primary'
                    textColor='primary'
                >
                    <Tab label='Overall Analytics' value='overall' />
                    <Tab label='Per Question Analytics' value='per question' />
                    <Tab label='My Attempts' value='attempts' />
                </Tabs>
                {this.tabs()}
            </Fragment>
        );
    }

    tabs() {
        const {test, testStats, theme} = this.props;
        const {mode, questionIndex} = this.state;
        const bestMark = (100 * Math.max(0, ...test.submitted.map(x => x.grade))) / test.total;
        if (mode === 'overall') {
            return <TestTab theme={theme} mark={bestMark} test={test} testStats={testStats} />;
        } else if (mode === 'per question') {
            return (
                <QuestionTab
                    selected={questionIndex}
                    selectQuestion={this.selectQuestion}
                    testStats={testStats}
                    theme={theme}
                />
            );
        } else if (mode === 'attempts') {
            return <MyAttemptsTab test={test} postTest={this.props.postTest} />;
        }
    }

    selectQuestion = (questionIndex: number) => this.setState({questionIndex});
}

function isOpen(test: Http.GetSections_Test, now: number) {
    return (
        (test.openTime === null || test.openTime < now) &&
        now < test.deadline &&
        (test.submitted.length < test.attempts || test.attempts === -1)
    );
}
