import React, {Component} from 'react';
import { Grid, Paper, Select, Grow, MenuItem, List, ListItem, ListItemText, Button, IconButton, Typography, ListItemSecondaryAction, Modal, TextField, Checkbox, FormControlLabel, Tooltip } from '@material-ui/core';
import { Fullscreen, Close, Edit, Done } from '@material-ui/icons';
import * as Http from '../Http';
import AnswerGauge from './AnswerGauge';
import {ThemeObj} from '../Models';
import debounce from '../SharedComponents/AVODebouncer';
import {Content} from '../HelperFunctions/Content';
import {ShowSnackBar} from '../Layout/Layout';

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

interface AnswerQueriesProps {
    conceptID: number;
    theme: ThemeObj; 
    showSnackBar: ShowSnackBar;
};

interface AnswerQueriesState {
    hasLoadedInquiries: boolean;
    inqueries: InquiryObject[];
    selectedInquiry: InquiryObject;
    answeredInquiries: number;
    showModal: boolean;
    hasAnswered: boolean;
    answerString: string;
};

export default class AnswerQueries extends Component<AnswerQueriesProps, AnswerQueriesState> {

    constructor(props: AnswerQueriesProps) {
        super(props);
        this.state = {
            hasLoadedInquiries: false,
            inqueries: [],
            selectedInquiry: {} as InquiryObject,
            showModal: false,
            hasAnswered: false,
            answeredInquiries: 0,
            answerString: '',
        };
    };

    render() {
        const answerChangeDebouncer = debounce({
            callback: (e: any) => this.setState({answerString: e.target.value}),
            wait: 300,
            immediate: false,
        });
        return (
            <Grid container spacing={8} style={{ width : '100%' }}>
                <Grid item xs={9}>
                    <List style={{ height : '80vh', overflowY: 'auto' }}>
                        {this.state.inqueries.map(InquiryObject => (
                            <ListItem>
                                <ListItemText 
                                    primary={InquiryObject.originalInquiry}
                                    secondary={`${(new Date(InquiryObject.timeCreated)).toLocaleString("en-US")}`}
                                />
                                <ListItemSecondaryAction>
                                    {InquiryObject.hasAnswered && (
                                        <Tooltip title='Answered'>
                                            <Done color="primary" style={{ position: 'relative', top: '7px' }}/>
                                        </Tooltip>
                                    )}
                                    <Tooltip title='Edit/Answer'>
                                        <IconButton color="primary" onClick={() => {
                                            this.setState({ showModal : true, selectedInquiry : InquiryObject, answerString : InquiryObject.inquiryAnswer, hasAnswered: InquiryObject.hasAnswered });
                                        }}>
                                            <Edit/>
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={3}>
                    <AnswerGauge 
                        theme={this.props.theme} 
                        answered=  {this.state.answeredInquiries} 
                        unanswered={this.state.inqueries.length - this.state.answeredInquiries}
                        width={'auto'}
                        height={'200px'}
                    />
                </Grid>
                <Modal
                    open={this.state.showModal}
                    aria-labelledby='modal-title'
                    aria-describedby='modal-description'
                    style={{
                        width: '80%',
                        top: '50px',
                        left: '10%',
                        right: '10%',
                        position: 'absolute',
                        height: '73vh',
                    }}
                >
                    <Paper className='avo-card' style={{ maxHeight: '72vh', height: 'inherit', width: 'auto' }}>
                        <IconButton
                            style={{position: 'absolute', right: '9px', top: '9px'}}
                            onClick={() => this.setState({showModal: false})}
                        >
                            <Close/>
                        </IconButton>
                        <Grid container spacing={8} style={{ width : '100%' }}>
                            <Grid item xs={6}>
                                <Typography variant="h6">Question Text</Typography>
                                <div style={{ height : '30vh', overflowY: 'auto', margin: '4px', overflowWrap: 'break-word' }}>
                                    <Content>{this.state.selectedInquiry.stringifiedQuestion}</Content>
                                </div>
                                <Typography variant="h6">Question Asked</Typography>
                                <div style={{ height : '30vh', overflowY: 'auto', margin: '4px', overflowWrap: 'break-word' }}>
                                    <Content>{this.state.selectedInquiry.originalInquiry}</Content>
                                </div>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="h6">Question Answer</Typography>
                                <div style={{ height : '30vh', overflowY: 'auto', overflowWrap: 'break-word', margin: '4px' }}>
                                    <Content>{this.state.answerString.length == 0 ? 'No answer provided yet' : this.state.answerString}</Content>
                                </div>
                                <div style={{ height : '30vh', margin: '4px' }}>
                                    <TextField
                                        id='question-string'
                                        variant='outlined'
                                        multiline
                                        rows='8'
                                        defaultValue={this.state.selectedInquiry.inquiryAnswer}
                                        style={{
                                            width : '100%',
                                        }}
                                        placeholder='Your answer here.'
                                        onChange={(e: any) => {
                                            e.persist();
                                            answerChangeDebouncer(e);
                                        }}
                                    />
                                </div>
                                <FormControlLabel
                                    style={{ paddingLeft : '12px' }}
                                    control={
                                        <Checkbox
                                            color="primary"
                                            checked={this.state.hasAnswered}
                                            onChange={() => this.setState({ hasAnswered : !this.state.hasAnswered })}
                                            inputProps={{ 'aria-label': 'primary checkbox' }}
                                        />
                                    }
                                    label="Show answer to student"
                                />
                                <Button color="primary" variant="outlined" onClick={this.editInquiry.bind(this)}>
                                    Save
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Modal>
            </Grid>
        );
    };

    componentDidMount() {
        Http.getInquiries(
            this.props.conceptID,
            1,
            (res: any) => {
                this.setState({ 
                    inqueries: res, 
                    answeredInquiries: (res as InquiryObject[]).filter(InquiryObject => InquiryObject.hasAnswered).length                 
                });
            },
            (res) => {
                console.log(res);
                this.props.showSnackBar('error', 'An error occurred', 2000);
            },
        );
    };

    editInquiry() {
        Http.editInquiry(
            this.state.selectedInquiry.ID,
            '',
            this.state.hasAnswered,
            this.state.answerString,
            (res) => {
                this.props.showSnackBar('success', 'Successfully updated Question', 2000);
                Http.getInquiries(
                    this.props.conceptID,
                    1,
                    (res: any) => {
                        this.setState({ 
                            inqueries: res,
                            answeredInquiries: (res as InquiryObject[]).filter(InquiryObject => InquiryObject.hasAnswered).length 
                        });
                    },
                    (res) => {
                        console.log(res);
                        this.props.showSnackBar('error', 'An error occurred', 2000);
                    },
                );
            },
            (res) => {
                console.log(res);
                this.props.showSnackBar('error', 'An error occurred', 2000);
            },
        );
    };

};