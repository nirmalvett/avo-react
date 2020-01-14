import React, {Component} from 'react';
import {Typography, Tabs, Tab, Grid, Card, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Tooltip, Modal, Paper} from '@material-ui/core';
import {Fullscreen, Done, Close} from '@material-ui/icons';
import * as Http from '../Http';
import 'react-infinite-calendar/styles.css';
import moment from 'moment';
import {CalendarTheme} from '../Models';
import {DatePicker} from '@material-ui/pickers';
import {MaterialUiPickersDate} from '@material-ui/pickers/typings/date';
import {ShowSnackBar} from '../Layout/Layout';
import {Content} from '../HelperFunctions/Content';

interface InquiryObject {
    ID: number;
    editedInquiry: string;
    hasAnswered: boolean;
    inquiryAnswer: string;
    inquiryType: boolean;
    originalInquiry: string;
    stringifiedQuestion: string;
    timeCreated: number;
    subscribed: boolean;
}

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
    inquiries: InquiryObject[];
    selectedInquiry: InquiryObject;
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
        inquiries: ([] as InquiryObject[]),
        selectedInquiry: {} as InquiryObject,
    };

    componentDidMount() {
        Http.home(
            response => {
                this.setState(response);
                Http.getCourses(
                    (res) => {
                        const courses = res.courses;
                        this.recursivelyGetInquiries(courses, 0);
                    },
                    (res) => {

                    }
                );
            },
            error => {
                console.log(error);
            },
        );
    }

    recursivelyGetInquiries(courses: any, index: number) {
        console.log(courses.length, index);
        if(courses.length == index) return;
        Http.getAllSubscribedOwnedInquiries(
            courses[index].courseID,
            (res) => {
                const inq = [...this.state.inquiries];
                inq.push(...(res as InquiryObject[]));
                this.setState(
                    {inquiries : inq}, 
                    () => {
                        // const idx = index+1;
                        // this.recursivelyGetInquiries(courses, idx)
                    }
                );
            }, 
            (res) => {

            }
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
                                <Tab label='Subscribed/Asked Questions' />
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
                            {value === 2 && (
                                <Grid item xs={12} sm={12} md={12} lg={12}>
                                    <Grid container><List style={{ height : '70vh', overflowY: 'auto' }}>{this.inquiries()}</List></Grid>
                                </Grid>
                            )}
                        </div>
                    </Card>
                </Grid>
                {this.inquiryModal()}
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

    inquiries() {
        return this.state.inquiries.map(InquiryObject => (
            <ListItem>
                <ListItemText 
                    primary={InquiryObject.originalInquiry}
                    secondary={`${(new Date(InquiryObject.timeCreated)).toLocaleString("en-US")}`}
                />
                <ListItemSecondaryAction>
                    {InquiryObject.hasAnswered && (
                        <Tooltip title="Answered">
                            <Done color="primary" style={{ position: 'relative', top: '7px' }}/>
                        </Tooltip>
                    )}
                    <IconButton color="primary" onClick={() => {
                        this.setState({ selectedInquiry : InquiryObject });
                    }}>
                        <Fullscreen/>
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
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

    inquiryModal() {
        return (
            <Modal
                open={!!this.state.selectedInquiry.ID}
                aria-labelledby='modal-title'
                aria-describedby='modal-description'
                style={{ 
                    width: '60%',
                    top: '50px',
                    left: '20%',
                    right: '20%',
                    maxHeight: '90%',
                    position: 'absolute',
                }}
            >
                <Paper className="avo-card">
                    {!!this.state.selectedInquiry.ID && (
                        <>
                            <IconButton
                                style={{position: 'absolute', right: '9px', top: '9px'}}
                                onClick={() => this.setState({ selectedInquiry : {} as InquiryObject })}
                            >
                                <Close/>
                            </IconButton>
                            <Typography variant='h4'>
                                Question
                            </Typography>
                            <Typography variant='caption'>
                                Asked on {(new Date()).toLocaleString("en-US")}
                            </Typography>
                            <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                                <div style={{ display: 'inline-block', width: '20%' }}>
                                    <Typography variant='h6'>
                                        Question Asked
                                    </Typography>
                                </div>
                                <div style={{ display: 'inline-block', width: '75%', marginRight: '5%' }}>
                                    <hr style={{ position: 'relative', top: '4px' }}/>
                                </div>
                            </div>
                            <Typography variant='body2'>
                                {this.state.selectedInquiry.editedInquiry.length > 0 ? this.state.selectedInquiry.editedInquiry : this.state.selectedInquiry.originalInquiry}
                            </Typography>
                            <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                                <div style={{ display: 'inline-block', width: '20%' }}>
                                    <Typography variant='h6'>
                                        Answer
                                    </Typography>
                                </div>
                                <div style={{ display: 'inline-block', width: '75%', marginRight: '5%' }}>
                                    <hr style={{ position: 'relative', top: '4px' }}/>
                                </div>
                            </div>
                            <Typography>
                                {
                                    this.state.selectedInquiry.hasAnswered ? 
                                        <Content>
                                            {this.state.selectedInquiry.inquiryAnswer}
                                        </Content> : 
                                        'This question has not been answered yet. if you want to get future updates please subscribe!'
                                }
                            </Typography>   
                            <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                                <div style={{ display: 'inline-block', width: '20%' }}>
                                    <Typography variant='h6'>
                                        Question Text
                                    </Typography>
                                </div>
                                <div style={{ display: 'inline-block', width: '75%', marginRight: '5%' }}>
                                    <hr style={{ position: 'relative', top: '4px' }}/>
                                </div>
                            </div>
                            <Typography variant='body2'>
                                <Content>{this.state.selectedInquiry.stringifiedQuestion}</Content>
                            </Typography>
                        </>
                    )}
                </Paper>
            </Modal>
        );
    };

    changeTab(value: Date) {
        this.setState({value: Number(value)});
    }

    handleDateChange = (date: MaterialUiPickersDate) => {
        if (!date) return;
        this.setState({selectedDate: new Date(date.toDate())});
    };
}
