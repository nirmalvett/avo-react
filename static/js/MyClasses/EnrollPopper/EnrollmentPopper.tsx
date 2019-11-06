import React, {Component} from 'react';
import {Dialog, Paper} from '@material-ui/core';
import * as Http from '../../Http';
import {Enroll_PaymentRequired} from '../../Http';
import {ThemeObj} from '../../Models';
import {EnrollTab} from './EnrollTab';
import {PaymentTab} from './PaymentTab';

interface EnrollmentPopperProps {
    open: boolean;
    theme: ThemeObj;
    onClose: () => void;
    onEnroll: () => void;
}

interface EnrollmentPopperState {
    code: string;
    enrollErrorMessage: string;
    enrollObj: Enroll_PaymentRequired | undefined;
}

export class EnrollmentPopper extends Component<EnrollmentPopperProps, EnrollmentPopperState> {
    constructor(props: EnrollmentPopperProps) {
        super(props);
        this.state = {
            code: '',
            enrollErrorMessage: '',
            enrollObj: undefined,
        };
    }

    componentDidUpdate(prevProps: EnrollmentPopperProps, prevState: EnrollmentPopperState) {
        if (prevProps.open && !this.props.open) {
            this.setState({code: '', enrollErrorMessage: '', enrollObj: undefined});
        }
    }

    render() {
        return (
            <Dialog open={this.props.open} onClose={this.props.onClose}>
                <Paper style={{padding: '10px', height: 'auto'}}>{this.getContent()}</Paper>
            </Dialog>
        );
    }

    getContent() {
        if (!this.state.enrollObj) {
            return (
                <EnrollTab
                    code={this.state.code}
                    onChange={code => this.setState({code})}
                    submitCode={this.submitCode}
                    errorMessage={this.state.enrollErrorMessage}
                    onClose={this.props.onClose}
                />
            );
        } else {
            return (
                <PaymentTab
                    enrollObj={this.state.enrollObj}
                    onClose={this.props.onClose}
                    onEnroll={this.props.onEnroll}
                    theme={this.props.theme}
                />
            );
        }
    }

    submitCode = () => {
        Http.enroll(
            this.state.code,
            result => {
                if (result.message === 'enrolled') {
                    this.props.onEnroll();
                } else {
                    this.setState({
                        enrollErrorMessage: '',
                        enrollObj: result,
                    });
                }
            },
            result => this.setState({enrollErrorMessage: result.error}),
        );
    };
}
