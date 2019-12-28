import React, { Component } from 'react';
import {
    Button, 
    IconButton, 
    Typography, 
    Paper, 
    Grow, 
    Tabs, 
    Tab, 
    FormControl, 
    Input, 
    InputAdornment, 
    TextField, 
    Checkbox, 
    Tooltip,
    FormControlLabel, 
    List, 
    ListItem, 
    ListItemSecondaryAction, 
    ListItemText  
} from '@material-ui/core';
import { Close } from '@material-ui/icons'; 
import SwipeableViews from 'react-swipeable-views';
import * as Http from '../../../Http';

interface InquiryPopupProps {
    ID: number;
    object: any;
};

interface InquiryPopupState {
    isOpen: boolean;
    activeTab: number;
    question: string;
    includeQuestionString: boolean;
};

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <Typography
            component='div'
            role='tabpanel'
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            <p>{children}</p>
        </Typography>
    );
}

function a11yProps(index: any) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export default class InquiryPopup extends Component<InquiryPopupProps, InquiryPopupState> {

    constructor(props: InquiryPopupProps) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: 0,
            question: '',
            includeQuestionString: true,
        };
    };

    render() {
        return (
            <div style={{ position : 'relative' }}>
                {this.renderButton()}
                {this.renderPopup()}
            </div>
        );
    };

    // The button which will propmt the user to ask the question
    renderButton() {
        return (
            <Button color="primary" variant="outlined" onClick={() => this.setState({ isOpen : true })}>
                Ask Question
            </Button>
        );
    };

    // the popup which will allow the user to ask a question and view other questions as well
    renderPopup() {
        return (
            <div style={{ position : 'absolute', bottom: '0px', right: '8px', width: '30vw', height: '50vh', display: this.state.isOpen ? 'block' : 'none' }}>
                <Grow in={this.state.isOpen}>
                    <Paper classes={{ root : 'avo-card avo-generic__low-shadow' }} style={{ width : 'calc(30vw - 4vw)', height : '49vh', position : 'relative' }}>
                        <Tabs
                            variant="fullWidth"
                            value={this.state.activeTab}
                            onChange={(e: any, val: number) => { this.setState({activeTab: val})}}
                            indicatorColor='primary'
                            textColor='primary'
                            aria-label='Question selection Tabs'
                        >
                            <Tab label='Ask Question' {...a11yProps(0)} />
                            <Tab label='View Questions' {...a11yProps(1)} />
                        </Tabs>
                        <SwipeableViews
                            axis={'x'}
                            index={this.state.activeTab}
                            onChangeIndex={(e: any) => console.log(e)}
                        >
                            <TabPanel value={this.state.activeTab} index={0} dir={'ltr'}>
                                {this.renderAskQuestionTab()}
                            </TabPanel>
                            <TabPanel value={this.state.activeTab} index={1} dir={'ltr'}>
                                {this.renderViewQuestionsTab()}
                            </TabPanel>
                        </SwipeableViews>
                        <IconButton style={{ position : 'absolute', bottom : '8px', right : '8px' }} onClick={() => this.setState({ isOpen : false })}>
                            <Close/>
                        </IconButton>
                    </Paper>
                </Grow>
            </div>
        );
    };

    renderAskQuestionTab() {
        return (
            <>
                <Typography variant={'body1'} id='modal-description'>
                    <TextField
                        id='question-string'
                        variant='outlined'
                        multiline
                        rows='4'
                        style={{
                            width : '100%',
                        }}
                        placeholder='Your Question Here...'
                        onChange={(e) => this.setState({ question : e.target.value })}
                    />
                    <FormControlLabel
                        style={{ paddingLeft : '12px' }}
                        control={
                            <Checkbox
                                checked={this.state.includeQuestionString}
                                onChange={() => this.setState({ includeQuestionString : !this.state.includeQuestionString })}
                                color="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                        }
                        label="Include Concept Lesson"
                    />
                    <Button onClick={this.submitInquiry.bind(this)}>
                        Submit Question
                    </Button>
                </Typography>
            </>
        );
    };

    renderViewQuestionsTab() {
        return(
            <List
                component='nav'
                style={{maxHeight: '25vh', overflowY: 'auto'}}
            >
                 {[1,2,3,4,5,6,7,8,9].map(i => <ListItem role={undefined} dense>
                    <ListItemText 
                        primary={`This is a question number #${i}`}
                        secondary={`${(new Date()).toLocaleString("en-US")}`} 
                    />
                    <ListItemSecondaryAction>
                        <Tooltip title="Subscibe to question">
                            <Checkbox
                                color="primary"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                        </Tooltip>
                    </ListItemSecondaryAction>
                 </ListItem>)}
            </List>
        );
    };

    submitInquiry() {
        Http.submitInquiry(
            {
                questionString : this.state.question,
                questionID : this.props.ID,
                inquiryType : 1,
                stringifiedQuestionObject : this.state.includeQuestionString ? this.props.object : '',
            },
            (res: any) => { console.log(res); },
            (res: any) => { console.log(res); },
        );
    };

};