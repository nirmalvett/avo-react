import React, {Component} from 'react';
import {Typography, Tabs, Tab, Grid, Card} from '@material-ui/core';
import * as Http from '../Http';
import 'react-infinite-calendar/styles.css';
import moment from 'moment';
import {CalendarTheme} from '../Models';
import {DatePicker} from '@material-ui/pickers';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';
import {ShowSnackBar} from "../Layout/Layout";

interface HomePageProps {
    color: {'200': string; '500': string};
    jumpToClass(classID: number): void;
    jumpToSet(classID: number, dueDateID: number): void;
    showSnackBar: ShowSnackBar;
}

interface HomePageState {
    selectedDate: Date;
    sections: Http.Home['sections'];
    value: number;
    calendarTheme: CalendarTheme;
}

export default class HomePage extends Component<HomePageProps, HomePageState> {
    state: HomePageState = {
        selectedDate: new Date(),
        sections: [],
        value: 0,
        calendarTheme: {
            accentColor: this.props.color['500'],
            floatingNav: {
                background: this.props.color['500'],
                chevron: '#FFA726',
                color: '#FFF',
            },
            headerColor: this.props.color['500'],
            selectionColor: this.props.color['500'],
            textColor: {
                active: '#FFF',
                default: '#333',
            },
            todayColor: this.props.color['200'],
            weekdayColor: this.props.color['200'],
        },
    };

    componentDidMount() {
        Http.home(
            response => {
                this.setState(response);
            },
            error => {
                console.log(error);
            },
        );
    }

    render() {
        const {value} = this.state;
        return (
            <div style={{flex: 1, overflowY: 'auto'}}>
                <Grid container>
                    <Card
                        className='avo-card'
                        style={{
                            width: '94%',
                            maxWidth: '100%',
                        }}
                    >
                        <div style={{position: 'inherit'}}>
                            <Tabs
                                value={value}
                                onChange={(e, v) => this.changeTab(v)}
                                indicatorColor='primary'
                                textColor='primary'
                            >
                                <Tab label='Due dates' />
                                <Tab label='Announcements' />
                            </Tabs>
                            {value === 0 && (
                                <Grid container>
                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                                        <DatePicker
                                            autoOk
                                            orientation='landscape'
                                            variant='static'
                                            openTo='date'
                                            value={this.state.selectedDate}
                                            onChange={this.handleDateChange}
                                        />
                                        {/*<InfiniteCalendar*/}
                                        {/*    onSelect={this.handleDateChange}*/}
                                        {/*    height={300}*/}
                                        {/*    selected={today}*/}
                                        {/*    minDate={today}*/}
                                        {/*    theme={this.state.calendarTheme}*/}
                                        {/*/>*/}
                                    </Grid>
                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                                        <Typography variant='subtitle1' color='textPrimary'>
                                            Due Dates
                                        </Typography>
                                        <hr />
                                        {this.dueDates()}
                                    </Grid>
                                </Grid>
                            )}
                            {value === 1 && (
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <Grid container>{this.notifications()}</Grid>
                                </Grid>
                            )}
                        </div>
                    </Card>
                </Grid>
            </div>
        );
    }

    notifications() {
        return this.state.sections.map(section => (
            <Grid item xs={12}>
                <div
                    className='avo-clickable-item'
                    onClick={() => this.props.jumpToClass(section.sectionID)}
                >
                    <Typography variant='h6' color='textPrimary'>
                        {section.name + ':'}
                    </Typography>
                </div>
                {section.announcements.map((notificationMsg, i) => (
                    <div
                        className='avo-clickable-item'
                        key={JSON.stringify(notificationMsg) + i}
                        onClick={() => this.props.jumpToClass(section.sectionID)}
                    >
                        <Typography variant='subtitle1' color='textPrimary'>
                            {notificationMsg.header}
                        </Typography>
                        <Typography variant='subtitle2' color='textPrimary'>
                            {notificationMsg.body}
                        </Typography>
                    </div>
                ))}
            </Grid>
        ));
    }

    dueDates = () => {
        return this.state.sections.map((dd, i) => {
            let datesToShow: {testID: number; name: string; deadline: number}[] = [];
            if (dd.tests) {
                datesToShow = dd.tests.filter(dueDate => {
                    const d1 = moment(new Date(dueDate.deadline)).startOf('day');
                    const selectedDate = moment(this.state.selectedDate).startOf('day');
                    return moment(d1)
                        .startOf('day')
                        .isSame(selectedDate.startOf('day'));
                });
            }
            return (
                <div key={i}>
                    <div
                        className='avo-clickable-item'
                        onClick={() => this.props.jumpToClass(dd.sectionID)}
                    >
                        <Typography variant='h6' color='textPrimary'>
                            {dd.name + ':'}
                        </Typography>
                    </div>
                    {datesToShow.length > 0 ? (
                        datesToShow.map((dueDate, i) => (
                            <div
                                className='avo-clickable-item'
                                key={JSON.stringify(dueDate) + i}
                                onClick={() => this.props.jumpToSet(dd.sectionID, dueDate.testID)}
                            >
                                <Typography variant='subtitle2' color='textPrimary'>
                                    {dueDate.name +
                                        ' - ' +
                                        moment(this.state.selectedDate)
                                            .toDate()
                                            .toDateString()}
                                </Typography>
                            </div>
                        ))
                    ) : (
                        <div>
                            <Typography variant='subtitle2' color='textPrimary'>
                                {'No due dates today'}
                            </Typography>
                        </div>
                    )}
                </div>
            );
        });
    };

    changeTab(value: Date) {
        this.setState({value: Number(value)});
    }

    handleDateChange = (date: MaterialUiPickersDate) => {
        if (!date) return;
        this.setState({selectedDate: new Date(date.toDate())});
    };
}
