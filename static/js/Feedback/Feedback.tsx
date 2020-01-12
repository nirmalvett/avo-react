import React, {Component} from 'react';
import * as Http from '../Http';
import {Button, TextField, Typography} from '@material-ui/core';

interface FeedbackState {
    message: string;
    waiting: boolean;
}

export default class Feedback extends Component<{}, FeedbackState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            message: '',
            waiting: false,
        };
    }

    render() {
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant='h5' style={{width: '50%', textAlign: 'center'}}>
                    Enter your feedback here. If you are reporting a bug, please be as specific as
                    possible so that it will be easier for us to find the problem. Thanks!
                </Typography>
                <TextField
                    multiline
                    value={this.state.message}
                    style={{width: '50%', margin: '10px'}}
                    onChange={e => this.setState({message: e.target.value as string})}
                    variant='outlined'
                    rows={8}
                    disabled={this.state.waiting}
                />
                <Button
                    onClick={this.sendFeedback}
                    color='primary'
                    variant='contained'
                    style={{width: '50%'}}
                    disabled={
                        this.state.waiting ||
                        !this.state.message.length ||
                        this.state.message.length > 2000
                    }
                >
                    Send
                </Button>
            </div>
        );
    }

    sendFeedback = () => {
        this.setState({waiting: true}, () =>
            Http.sendFeedback(
                this.state.message,
                () => this.setState({message: '', waiting: false}),
                () => this.setState({waiting: false}),
            ),
        );
    };
}
