import React, {Fragment} from 'react';
import {Typography} from '@material-ui/core';
import * as Http from '../Http';
// @ts-ignore
import Chart from 'react-apexcharts';
import {generateChartOptions} from './chartOptions';
import {ThemeObj} from '../Models';

interface SectionAnalyticsProps {
    section: Http.GetSections_Section;
    chartWidth: number;
    theme: ThemeObj;
}

export function SectionAnalytics(props: SectionAnalyticsProps) {
    return (
        <Fragment>
            <Typography
                variant='h5'
                color='textPrimary'
                style={{paddingLeft: '8px', marginBottom: '16px'}}
            >
                {props.section.name}
            </Typography>
            <Typography
                component={'span'}
                variant='body1'
                color='textPrimary'
                classes={{root: 'avo-padding__16px'}}
            >
                {props.section.tests.length === 0 &&
                    "This Section doesn't have any tests or assignments yet!"}
            </Typography>
            <div className='mixed-chart'>
                {props.section.tests.length !== 0 ? ( // if there is at least one test then display data
                    <Fragment>
                        <Chart
                            options={generateChartOptions(props.section, props.theme)}
                            series={processClassChartData(props.section)}
                            type='line'
                            width={props.chartWidth}
                        />
                        <Typography
                            component={'span'}
                            variant='body2'
                            color='textPrimary'
                            classes={{root: 'avo-padding__16px'}}
                        >
                            Average: Based on the average of the best attempts of each student who
                            took the test or assignment.
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
                ) : null}
            </div>
        </Fragment>
    );
}

function processClassChartData(section: Http.GetSections_Section) {
    const classAvg = [];
    const myMark = [];
    const standardDev = [];
    for (let i = 0; i < section.tests.length; i++) {
        const testObj = section.tests[i];
        classAvg.push((testObj.sectionAverage * 100).toFixed(2));
        standardDev.push((testObj.standardDeviation * 100).toFixed(2));
        let myAvg = -1;
        for (let j = 0; j < testObj.submitted.length; j++) {
            const takeObj = testObj.submitted[j];
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
