import React, {PureComponent} from 'react';
import {Typography} from '@material-ui/core';
import {isChrome} from '../HelperFunctions/Helpers';
import {ShowSnackBar} from '../Layout/Layout';

export default class HomePageOld extends PureComponent<{showSnackBar: ShowSnackBar}> {
    render() {
        return (
            <div style={{margin: '80px', flex: 1, overflowY: 'auto'}}>
                <Typography variant='h4' color='textPrimary'>
                    Welcome to AVO!
                </Typography>
                <Typography variant='subtitle1' color='textPrimary'>
                    AVO is the future of AI assisted learning, and utilizes cutting edge
                    methodologies & systems to deliver an incomparable experience.
                </Typography>
                <br />
            </div>
        );
    }

    componentDidMount() {
        if (!isChrome()) {
            this.props.showSnackBar(
                'warning',
                'We have detected that you are currently not using ' +
                    'Google Chrome Browser. This is not recommended as AVO has not been properly tested in your current ' +
                    'browser and many of the basic functionality may not work.',
                10000000000000,
            );
        }
    }
}
