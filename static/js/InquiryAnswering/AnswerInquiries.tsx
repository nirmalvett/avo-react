import React, { Component } from 'react';
import { Grid, Paper, Grow } from '@material-ui/core';
import * as Http from '../Http';
import {Course} from '../Http/types';

interface InquiredConcept {
    ID: number;
    name: string;
    answered: number;
    unanswered: number;
};

interface AnswerInquiriesProps {

};

interface AnswerInquiriesState {
    hasLoadedConcepts: boolean;
    hasLoadedInquiriesForConcept: boolean;
    inquiredConcepts: InquiredConcept[];
    courses: Course[];
};

export default class AnswerInquiries extends Component<AnswerInquiriesProps, AnswerInquiriesState> {
    pollFrequency: number;
    intervalObject: any;

    constructor(props: AnswerInquiriesProps) {
        super(props);
        this.state = {
            hasLoadedConcepts: false,
            hasLoadedInquiriesForConcept: false,
            inquiredConcepts: [],
            courses: []
        };

        this.pollFrequency = 1000 * 60 * 2;
    };

    render() {
        return (
            <div>
                <Grid container spacing={8}>
                    {this.state.inquiredConcepts.map((InquiredConcept, i: number) => (
                        <Grid item xs={3}>
                            <Grow in={this.state.hasLoadedConcepts} timeout={i * 300}>
                                <Paper className='avo-card'>
                                    {InquiredConcept.name}
                                </Paper>
                            </Grow>
                        </Grid>
                    ))}
                </Grid>
            </div>
        );
    };

    componentDidMount() {
        // Http.getAllInquiredConcepts()
        Http.getCourses(
            res => {
                const courses = res.courses;
                // if (classes.length > 0) {
                this.setState(
                    {
                        courses,
                    }
                );
                Http.getAllInquiredConcepts(
                    courses[0].courseID,
                    (res) => {
                        console.log(res)
                    },
                    () => {},
                );
                // }
            },
            err => {
                console.log(err);
            },
        );
    };

    

};