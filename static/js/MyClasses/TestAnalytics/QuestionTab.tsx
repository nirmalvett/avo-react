import React from 'react';
import {FormControl, Input, MenuItem, Select, Typography} from '@material-ui/core';
// @ts-ignore
import Chart from 'react-apexcharts';
import {TestStats} from '../../Http';
import {convertListFloatToAnalytics} from '../../HelperFunctions/Helpers';
import {getPerQuestionGraphOptions} from '../chartOptions';
import {ThemeObj} from '../../Models';

interface QuestionTabProps {
    selected: number;
    selectQuestion: (question: number) => void;
    testStats: TestStats;
    theme: ThemeObj;
}

export function QuestionTab(props: QuestionTabProps) {
    const q = props.testStats.questions[props.selected];
    const dataObj = convertListFloatToAnalytics(q.marks, q.total);
    return (
        <div style={{overflowY: 'auto', overflowX: 'hidden', textAlign: 'center'}}>
            <br />
            <Typography component={'span'} variant='body1' color='textPrimary'>
                <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
                    <FormControl>
                        {/*<InputLabel htmlFor="test-stats__data-display">Question to display</InputLabel>*/}
                        <Select
                            value={props.selected}
                            onChange={e => props.selectQuestion(e.target.value as number)}
                            input={<Input name='dataSelected' id='test-stats__data-display' />}
                        >
                            {props.testStats.questions.map((obj, idx) => (
                                <MenuItem value={idx} key={'QuestionStats' + idx}>{`Question ${idx +
                                    1}`}</MenuItem>
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
                    {q.marks.length}
                </span>
                <span
                    style={{
                        marginLeft: '1.0em',
                        marginRight: '1.0em',
                    }}
                >
                    <b>Median Score: </b>
                    {q.median.toFixed(2)}
                </span>
                <br />
                <span
                    style={{
                        marginLeft: '1.0em',
                        marginRight: '1.0em',
                    }}
                >
                    <b>Mean Score: </b>
                    {q.mean.toFixed(2)}
                </span>
                <span
                    style={{
                        marginLeft: '1.0em',
                        marginRight: '1.0em',
                    }}
                >
                    <b>Std. Dev: </b>
                    {q.standardDeviation.toFixed(2)}%
                </span>
            </Typography>
            <Chart
                options={getPerQuestionGraphOptions(
                    props.testStats,
                    props.selected,
                    3,
                    props.theme,
                )}
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
