import React, {Component, ReactElement} from 'react';
import {
    Typography,
    Tabs,
    Tab,
    Grid,
    Card,
} from '@material-ui/core';
import {isChrome} from '../HelperFunctions/Helpers';
import * as Http from '../Http';
import InfiniteCalendar from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css';
import moment from 'moment';
import {CalendarTheme} from '../Models';
// Or import the input component
let today = new Date();
function TabContainer(props: {children?: any}): ReactElement {
    return (
        <Typography component='div' style={{padding: 8 * 3}}>
            {props.children}
        </Typography>
    );
}

interface HomePageProps {
    color: {'200': string; '500': string};
    jumpToClass(classID: number): void;
    jumpToSet(classID: number, dueDateID: number): void;
    showSnackBar(header: string, message: string, time: number): void;
}

interface HomePageState {
    selectedDate: Date;
    notifications: Http.Home['messages'];
    dueDates: Http.Home['dueDates'];
    value: number;
    calendarTheme: CalendarTheme;
}

export default class HomePage extends Component<HomePageProps, HomePageState> {
    state: HomePageState = {
        selectedDate: new Date(),
        notifications: [],
        dueDates: [],
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

    componentWillMount() {
        Http.home(
            response => {
                console.log(response);
                this.setState({
                    dueDates: response.dueDates,
                    notifications: response.messages,
                });
            },
            error => {
                console.log(error);
            },
        );
    }

    render() {
        const {value} = this.state;
        return (
            <div style={{ flex: 1, overflowY: 'auto'}}>
                <Grid container>
                    <Card
                        className="avo-card"
                        style={{
                            width: '94%',
                            maxWidth: '100%',
                        }}
                    >
                        <div style={{ position : 'inherit' }}>
                            <Tabs
                                value={value}
                                onChange={(e, v) => this.changeTab(v)}
                                indicatorColor='primary'
                                textColor='primary'
                            >
                                <Tab label='Due dates' />
                                <Tab label='Messages' />
                            </Tabs>
                            {value === 0 && (
                                <Grid
                                    container
                                >
                                    <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                    >
                                        <InfiniteCalendar
                                            onSelect={this.handleDateChange}
                                            height={300}
                                            selected={today}
                                            minDate={today}
                                            theme={this.state.calendarTheme}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                    >
                                        <Typography variant='subtitle1' color='textPrimary'>
                                            Due Dates
                                        </Typography>
                                        <hr/>
                                        {this.dueDates()}
                                    </Grid>
                                </Grid>
                            )}
                            {value === 1 && (
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <Grid
                                        container
                                    >
                                        {this.notifications()}
                                    </Grid>
                                </Grid>
                            )}
                        </div>
                    </Card>
                </Grid>
            </div>
        );
    }

    notifications() {
        return this.state.notifications.map(notification => (
            <Grid item xs={12}>
                <div className='avo-clickable-item' onClick={() => this.props.jumpToClass(notification.class.id)}>
                    <Typography variant='h6' color='textPrimary'>
                        {notification.class.name + ':'}
                    </Typography>
                </div>
                {notification.messages.map((notificationMsg, i) => (
                    <div
                        className='avo-clickable-item'
                        key={JSON.stringify(notificationMsg) + i}
                        onClick={() => this.props.jumpToClass(notification.class.id)}
                    >
                        <Typography variant='subtitle1' color='textPrimary'>
                            {notificationMsg.title}
                        </Typography>
                        <Typography variant='subtitle2' color='textPrimary'>
                            {notificationMsg.body}
                        </Typography>
                    </div>
                ))}
            </Grid>
        ));
    }

    dueDates() {
        return this.state.dueDates.map((dd, i) => {
            let datesToShow: {id: number; name: string; dueDate: number}[] = [];
            if (dd.dueDates !== undefined) {
                datesToShow = dd.dueDates.filter(dueDate =>
                    moment(new Date(dueDate.dueDate))
                        .endOf('day')
                        .isSame(moment(this.state.selectedDate).endOf('day')),
                );
            }
            return (
                <div key={i}>
                    <div className='avo-clickable-item' onClick={() => this.props.jumpToClass(dd.class.id)}>
                        <Typography variant='h6' color='textPrimary'>
                            {dd.class.name + ':'}
                        </Typography>
                    </div>
                    {datesToShow.length > 0 ? (
                        datesToShow.map((dueDate, i) => (
                            <div
                                className='avo-clickable-item'
                                key={JSON.stringify(dueDate) + i}
                                onClick={() => this.props.jumpToSet(dd.class.id, dueDate.id)}
                            >
                                <Typography variant='subtitle2' color='textPrimary'>
                                    {dueDate.name +
                                        ' - ' +
                                        new Date(dueDate.dueDate).toDateString()}
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
    }

    changeTab(value: Date) {
        this.setState({value: Number(value)});
    }

    handleDateChange(date: Date) { this.setState({selectedDate: date}) };

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
