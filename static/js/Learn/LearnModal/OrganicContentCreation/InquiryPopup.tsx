import React, { Component } from 'react';
import {Button, IconButton, Typography, Tooltip, Paper, Grow } from '@material-ui/core';
import { Close } from '@material-ui/icons'; 

interface InquiryPopupProps {
    
};

interface InquiryPopupState {
    isOpen: boolean;
};

export default class InquiryPopup extends Component<InquiryPopupProps, InquiryPopupState> {

    constructor(props: InquiryPopupProps) {
        super(props);
        this.state = {
            isOpen: false
        };
    };

    render() {
        return (
            <div style={{ position : 'relative' }}>
                {this.renderButton()}
                {this.state.isOpen && this.renderPopup()}
            </div>
        );
    };

    // The button which will propmt the user to ask the question
    renderButton() {
        return (
            <Button color="primary" variant="outlined" onClick={() => this.setState({ isOpen : true })}>
                Ask Question
            </Button>
        );
    };

    // the popup which will allow the user to ask a question and view other questions as well
    renderPopup() {
        return (
            <div style={{ position : 'absolute', bottom: '0px', right: '8px', width: '30vw', height: '45vh' }}>
                <Grow in={this.state.isOpen}>
                    <Paper classes={{ root : 'avo-card avo-generic__low-shadow' }} style={{ width : 'calc(30vw - 4vw)', height : '100%', position : 'relative' }}>
                        <Typography variant='body2'>
                            Hello world, I'm gonna be populated with data soon!
                        </Typography>
                        <IconButton style={{ position : 'absolute', bottom : '8px', right : '8px' }} onClick={() => this.setState({ isOpen : false })}>
                            <Close/>
                        </IconButton>
                    </Paper>
                </Grow>
            </div>
        );
    };

};