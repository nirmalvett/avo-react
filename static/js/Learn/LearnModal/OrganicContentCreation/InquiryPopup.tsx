import React, { Component } from 'react';
import {
    Button, 
    IconButton, 
    Typography, 
    Paper, 
    Grow, 
    Fade,
    Tabs, 
    Tab, 
    FormControl, 
    Input, 
    InputAdornment, 
    TextField,
    Modal,
    Checkbox, 
    Tooltip,
    FormControlLabel, 
    List, 
    ListItem, 
    ListItemSecondaryAction, 
    ListItemText  
} from '@material-ui/core';
import { Close, Fullscreen } from '@material-ui/icons'; 
import SwipeableViews from 'react-swipeable-views';
import debounce from '../../../SharedComponents/AVODebouncer';
import {Content} from '../../../HelperFunctions/Content';
import * as Http from '../../../Http';
import {ShowSnackBar, SnackbarVariant} from "../../../Layout/Layout";
import {AVOLanguage} from "../../../Language/English";

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

interface InquiryPopupProps {
    ID: number;
    object: any;
    showSnackBar: ShowSnackBar;
}

interface InquiryPopupState {
    isOpen: boolean;
    activeTab: number;
    question: string;
    isQuestionModalOpen: boolean;
    includeQuestionString: boolean;
    hasSubmittedInquiry: boolean;
    inquiries: InquiryObject[];
    selectedInquiry: InquiryObject;
}

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
            style={{ position : 'relative' }}
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

const msSnackBar: number = 2000;

export default class InquiryPopup extends Component<InquiryPopupProps, InquiryPopupState> {
    poller: any;

    constructor(props: InquiryPopupProps) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: 0,
            question: '',
            isQuestionModalOpen: false,
            includeQuestionString: true,
            hasSubmittedInquiry: false,
            inquiries: [],
            selectedInquiry: {} as InquiryObject,
        };
    };

    render() {
        return (
            <div style={{ position : 'relative' }}>
                {this.renderButton()}
                {this.renderPopup()}
                <Modal
                    open={this.state.isQuestionModalOpen}
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
                        {this.state.isQuestionModalOpen && (
                            <>
                                <IconButton
                                    style={{position: 'absolute', right: '9px', top: '9px'}}
                                    onClick={() => this.setState({ isQuestionModalOpen: false })}
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
            </div>
        );
    };

    componentDidMount() {
        this.getInquiries();
        this.poller = setInterval(() => {
            this.getInquiries();
        }, 1000 * 60);
    };

    componentWillUnmount() {
        clearInterval(this.poller);
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
                            onChange={(e: any, val: number) => { console.log(this.state); this.setState({activeTab: val})}}
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
        const questionChangeDebouncer = debounce({
            callback: (e: any) => this.setState({question: e.target.value}),
            wait: 300,
            immediate: false,
        });
        return (
            <Typography variant={'body1'} id='modal-description'>
                <TextField
                    id='question-string'
                    variant='outlined'
                    multiline
                    rows='4'
                    style={{
                        width : '100%',
                    }}
                    placeholder='Your question here... (must be more than 12 characters)'
                    onChange={(e: any) => {
                        e.persist();
                        questionChangeDebouncer(e);
                    }}
                />
                <FormControlLabel
                    style={{ paddingLeft : '12px' }}
                    control={
                        <Checkbox
                            id={`inquiry-checkbox-button-${this.props.ID}`}
                            checked={this.state.includeQuestionString}
                            onChange={() => this.setState({ includeQuestionString : !this.state.includeQuestionString })}
                            color="primary"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    }
                    label="Include Concept Lesson"
                />
                {/* ================================= SUBMIT INQUIRY BUTTON =========================================*/}
                <Button
                    id={`inquiry-submit-button-${this.props.ID}`}
                    onClick={ this.submitInquiry.bind(this)}
                    disabled={this.state.question.length < 12}>
                    {
                        // If the question length less than 12 characters then we won't let the user submit
                        this.state.question.length < 12
                            ? AVOLanguage.StrInquiryNotEnoughCharacter
                            : AVOLanguage.StrSubmitQuestion
                    }
                </Button>
                <div style={{ 
                    position: "absolute",  
                    top: '0', 
                    left: '0', 
                    width: '100%', 
                    height: '100%', 
                    pointerEvents: this.state.hasSubmittedInquiry ? 'auto' : 'none', 
                    opacity: this.state.hasSubmittedInquiry ? 1 : 0,
                    transition: 'opacity 300ms ease-in'
                }}>
                    <Paper style={{ 
                        position: "absolute",  
                        top: '0', 
                        left: '0', 
                        width: '100%', 
                        height: '100%', 
                    }}>
                        {this.state.hasSubmittedInquiry && (
                            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                            </svg>
                        )}
                        <Typography variant={'body1'} style={{ textAlign: 'center',  }}>
                            Congrats, submission complete
                        </Typography>
                    </Paper>
                </div>
            </Typography>
        );
    };

    renderViewQuestionsTab() {
        return(
            <List
                component='nav'
                style={{maxHeight: '25vh', overflowY: 'auto'}}
            >
                 {this.state.inquiries.map(InquiryObject => { 
                    let inquiryString: string = `${(InquiryObject.editedInquiry.length > 0 ? InquiryObject.editedInquiry : InquiryObject.originalInquiry)}`;
                    if(inquiryString.length > 23) {
                        inquiryString = inquiryString.substring(0, 22) + '...';
                    }
                    return( 
                        <ListItem role={undefined} dense>
                            <ListItemText  
                                primary={
                                    <Tooltip 
                                        title={
                                            <div style={{ maxWidth : '200px', height: 'fit-content', overflowWrap: 'break-word', wordWrap: 'break-word', hyphens: 'auto' }}>
                                                {InquiryObject.editedInquiry.length > 0 ? InquiryObject.editedInquiry : InquiryObject.originalInquiry}
                                            </div>
                                        }
                                    >
                                        <span>{inquiryString}</span>
                                    </Tooltip>
                                }
                                secondary={`${(new Date(InquiryObject.timeCreated)).toLocaleString("en-US")}`} 
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title={'View Question/Answer'}>
                                    <Fullscreen color="primary" style={{ top: '8px', position: 'relative' }} onClick={() => this.openInquiry(InquiryObject)}/>
                                </Tooltip>
                                <Tooltip title="Subscibe to question">
                                    <Checkbox
                                        color="primary"
                                        onChange={() => {
                                            let copy = [...this.state.inquiries];
                                            copy = copy.map((io: InquiryObject) => {
                                                if(io.ID == InquiryObject.ID)
                                                {
                                                    const objectCopy = {...io};
                                                    objectCopy.subscribed = !objectCopy.subscribed;
                                                    if(objectCopy.subscribed)
                                                        this.subscribeToInquiry(objectCopy.ID);
                                                    else 
                                                        this.unsubscribeToInquiry(objectCopy.ID);
                                                    return objectCopy;
                                                }
                                                return io;
                                            });
                                            this.setState({ inquiries : copy });
                                        }}
                                        checked={InquiryObject.subscribed}
                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                    />
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                    )}
                )}
                {this.state.inquiries.length == 0 && (
                    <div style={{ margin: 'auto', textAlign: 'center' }}>
                        No questions available.
                    </div>
                )}
            </List>
        ); 
    };

    openInquiry(inquiry: InquiryObject) {
        this.setState({  
            isQuestionModalOpen : true,
            selectedInquiry: inquiry
        });
    };

    submitInquiry() {
        Http.submitInquiry(
            {
                questionString : this.state.question,
                questionID : this.props.ID,
                inquiryType : 1,
                stringifiedQuestionObject : this.state.includeQuestionString ? this.props.object : '',
            },
            (res: any) => {
                this.props.showSnackBar('success', "Your question was successfully submitted.", msSnackBar);
                (document as any).getElementById('question-string').value = '';
                this.setState(
                    { 
                        includeQuestionString: true,
                        hasSubmittedInquiry : true,
                        question: '',
                    }, 
                    () => {
                        setTimeout(() => {
                            this.setState({ hasSubmittedInquiry : false });
                        }, 2000);
                    }
                );
            },
            (res: any) => {
                this.props.showSnackBar('error', "Hmm your question could not be submitted... please try again in a couple minutes", msSnackBar);
                console.log(res);
            },
        );
    };

    subscribeToInquiry(inquiryID: number) {
        Http.subscribeToInquiry(
            inquiryID, 
            (res) => {},
            (res) => {
                this.props.showSnackBar('error', "Hmm it look it like there was an error subscribing... please try again in a couple minutes.", msSnackBar);
            }
        );
    };

    unsubscribeToInquiry(inquiryID: number) {
        Http.unsubscribeToInquiry(
            inquiryID, 
           (res) => {},
            (res) => {
                this.props.showSnackBar('error', "Hmm it looks like there was an error unsubscribing... please try again in a couple minutes.", msSnackBar);
            }
        );
    };

    getInquiries() {
        Http.getInquiries(
            this.props.ID,
            1,
            (res: InquiryObject[]) => { 
                this.setState({ inquiries: res });
            },
            (res: any) => {
                this.props.showSnackBar('error', "Hmm it looks like there was an issue getting inquiries...please try again in a couple mintes..", msSnackBar);
                console.log(res); 
            },
        );
    };

};