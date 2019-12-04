import React, {PureComponent} from 'react';
import {Typography} from '@material-ui/core';

export default class HomePageOld extends PureComponent<{}> {
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
}
