import React, { Component, Fragment } from 'react';
import { Typography } from '@material-ui/core';
import { isChrome } from "./helpers";
import { DatePicker } from "material-ui-pickers";
import Grid from '@material-ui/core/Grid/Grid';
import Http from './Http';
var uniqid = require('uniqid');

export default class HomePage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedDate: new Date(),
            notifications: [],
            dueDates: []
        }
        this.getHome()
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
                                <br />
                                {this.state.dueDates.filter((dueDate) => {
                                    let parts = dueDate.dueDate.split(' ')
                                    let month = new Date(Date.parse(parts[2] + " 1, 2018")).getMonth()
                                    let newDate = new Date(parts[3], month, parts[1])
                                    return newDate.getDate() === this.state.selectedDate.getDate() && newDate.getMonth() === this.state.selectedDate.getMonth() && newDate.getFullYear() === this.state.selectedDate.getFullYear()
                                }).map((dueDate) => (
                                    <div key={uniqid()}>
                                        <Typography variant='headline' color='textPrimary'>{dueDate.name}</Typography>
                                        <Typography variant='subheading' color='textPrimary'>{dueDate.dueDate}</Typography>
                                    </div>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <Grid container
                                direction="column"
                                justify="flex-start"
                                alignItems="flex-start">
                                {
                                    this.state.notifications.map((notification, i) => (
                                        <div key={uniqid()}>
                                            <Typography variant='display1' color='textPrimary'>{notification.class.name + ' - ' + notification.Title}</Typography>
                                            <Typography variant='subheading' color='textPrimary'>{notification.body}</Typography>
                                            <br />
                                        </div>
                                    ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            </div>
        );
    }
    getHome() {
        Http.getHome((response) => {
            this.setState({
                dueDates: response.dueDates,
                notifications: response.messages
            })
        }, (error) => { console.log(error) })
    }
    handleDateChange(date) {
        this.setState({ selectedDate: new Date(date) })
    }
    componentDidMount() {
        if (!isChrome()) {
            this.props.showSnackBar("warning", "We have detected that you are currently not using " +
                "Google Chrome Browser. This is not recommended as AVO has not been properly tested in your current " +
                "browser and many of the basic functionality may not work.", 10000000000000);
        }
    }
}
