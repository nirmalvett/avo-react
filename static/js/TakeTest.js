import React from 'react';
import Typography from '@material-ui/core/Typography/Typography';

export default class TakeTest extends React.Component {
    render() {
        return (
            <div style={{margin: '80px', flex: 1, overflowY: 'auto'}}>
                <Typography variant='display1' color='textPrimary'>Welcome to AVO!</Typography>
                <Typography variant='subheading'>AVO is the future of AI assisted learning, and utilizes cutting edge
                    methodologies & systems to deliver an incomparable experience.</Typography>
            </div>
        );
    }
}