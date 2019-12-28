import React, { Component } from 'react';
import { Grid, Paper } from '@material-ui/core';

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
        };

        this.pollFrequency = 1000 * 60 * 2;
    };

    render() {
        return (
            <div></div>
        );
    };

    componentDidMount() {

    };

};