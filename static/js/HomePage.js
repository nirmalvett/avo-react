import React, { Component, Fragment } from 'react';
import { Typography } from '@material-ui/core';
import { isChrome } from "./helpers";
import { DatePicker } from "material-ui-pickers";
import Grid from '@material-ui/core/Grid/Grid';

export default class HomePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedDate: new Date(),
            notifications: ["oh boy! a notification", "oh boy! a notification", "oh boy! a notification"],
            dueDates: ['hohoho some due dates', 'hohoho some due dates', 'hohoho some due dates']
        }
    }

    render() {

        return (
            <div style={{ margin: '80px', flex: 1, overflowY: 'auto' }}>
                <Grid container
                    direction="column"
                    justify="flex-start"
                    alignItems="flex-start">
                    <Typography variant='display1' color='textPrimary'>Welcome to AVO!</Typography>
                    <br />
                    <Typography variant='subheading'>AVO is the future of AI assisted learning, and utilizes cutting edge
                    methodologies & systems to deliver an incomparable experience.</Typography>
                    <br />
                    <Fragment>
                        <div className="picker">
                            <DatePicker
                                label="Check Due Dates"
                                value={this.state.selectedDate}
                                onChange={date => this.handleDateChange(date)}
                                animateYearScrolling
                            />
                        </div>
                    </Fragment>
                    <br />
                    <Grid container>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Grid container
                                direction="column"
                                justify="flex-start"
                                alignItems="flex-start">
                                <Typography variant='display1' color='textPrimary'>Due Dates</Typography>
                                {this.state.dueDates.map((dueDate) => (
                                    <div>
                                        <Typography variant='subheading' color='textPrimary'>{dueDate}</Typography>
                                    </div>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Grid container
                                direction="column"
                                justify="flex-start"
                                alignItems="flex-start">
                                <Typography variant='display1' color='textPrimary'>Notifications</Typography>
                                {this.state.notifications.map((notification) => (
                                    <div>
                                        <Typography variant='subheading' color='textPrimary'>{notification}</Typography>
                                    </div>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </div>
        );
    }
    handleDateChange(date) {
        this.setState({ selectedDate: date })
    }
    componentDidMount() {
        if (!isChrome()) {
            this.props.showSnackBar("warning", "We have detected that you are currently not using " +
                "Google Chrome Browser. This is not recommended as AVO has not been properly tested in your current " +
                "browser and many of the basic functionality may not work.", 10000000000000);
        }
    }
}
