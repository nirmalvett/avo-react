import React from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import { isChrome, notChromeMessage } from "./helpers";
export default class HomePage extends React.Component {
    render() {

        return (
            <div style={{margin: '80px', flex: 1, overflowY: 'auto'}}>
                <Typography variant='display1' color='textPrimary'>Welcome to AVO!</Typography>
                <Typography variant='subheading'>AVO is the future of AI assisted learning, and utilizes cutting edge
                    methodologies & systems to deliver an incomparable experience.</Typography>
              <br/>
              { // If it's not Chrome we want to display this message
                !isChrome()
                    ? <Typography variant='display1'> { "We have detected that you are currently not using Google Chrome Browser. " +
                    "This is not recommended as AVO has not been properly tested in your current browser and many of the basic functionality may not work. " +
                    "" } </Typography>
                    : null
              }

            </div>
        );
    }
}