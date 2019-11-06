import {Typography} from '@material-ui/core';
import React from 'react';
import {GetSections_Test, TestStats} from '../../Http';
// @ts-ignore
import Chart from 'react-apexcharts';
import {getTestCardGraphOptions} from '../chartOptions';
import {ThemeObj} from '../../Models';
import {convertListFloatToAnalytics} from '../../HelperFunctions/Helpers';

interface TestTabProps {
    test: GetSections_Test;
    testStats: TestStats;
    theme: ThemeObj;
    mark: number;
}

export function TestTab(props: TestTabProps) {
    const dataObj = convertListFloatToAnalytics(props.testStats.grades, props.test.total);
    return (
        <div style={{overflowY: 'auto', overflowX: 'hidden', textAlign: 'center'}}>
            <br />
            <Typography component='span' variant='body1' color='textPrimary'>
                <span>
                    <span
                        style={{
                            marginLeft: '0.75em',
                            marginRight: '0.75em',
                        }}
                    >
                        <b>Students:</b> {props.testStats.grades.length}
                    </span>
                    <span
                        style={{
                            marginLeft: '0.75em',
                            marginRight: '0.75em',
                        }}
                    >
                        <b>Median Scores:</b> {props.test.sectionMedian}
                    </span>
                    <span
                        style={{
                            marginLeft: '0.75em',
                            marginRight: '0.75em',
                        }}
                    >
                        <b>Mean Scores:</b> {props.test.sectionAverage}
                    </span>
                    <br />
                    <span
                        style={{
                            marginLeft: '0.75em',
                            marginRight: '0.75em',
                        }}
                    >
                        <b>Std. Dev:</b> {props.test.standardDeviation}%
                    </span>
                    <span
                        style={{
                            marginLeft: '0.75em',
                            marginRight: '0.75em',
                        }}
                    >
                        <b>My Best Attempt:</b> {Math.round((props.mark / 100) * props.test.total)}
                    </span>
                </span>
            </Typography>
            <br />
            <Chart
                options={getTestCardGraphOptions(props.test, props.testStats, props.theme, 3)}
                series={[
                    {
                        name: 'Number of Students',
                        type: 'column',
                        data: Object.values(dataObj),
                    },
                ]}
                type='line'
                width='100%'
            />
        </div>
    );
}
