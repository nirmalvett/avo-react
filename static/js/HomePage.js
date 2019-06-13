import React, { Component } from 'react';
import { Typography } from '@material-ui/core';
import { isChrome } from "./helpers";


export default class HomePage extends Component {
    render() {
        return (
            <div style={{margin: '80px', flex: 1, overflowY: 'auto'}}>
                <Typography variant='display1' color='textPrimary'>Welcome to AVO!</Typography>
                <Typography variant='subheading'>AVO is the future of AI assisted learning, and utilizes cutting edge
                    methodologies & systems to deliver an incomparable experience.</Typography>
                <br/>
            </div>
        );
    }

    componentDidMount() {
        if (!isChrome()) {
            this.props.showSnackBar("warning", "We have detected that you are currently not using " +
                "Google Chrome Browser. This is not recommended as AVO has not been properly tested in your current " +
                "browser and many of the basic functionality may not work.", 10000000000000);
        }
    }
}
