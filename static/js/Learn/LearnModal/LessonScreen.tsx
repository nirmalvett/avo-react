import React, {Fragment, PureComponent} from 'react';
import {
    Button, 
    IconButton, 
    Typography, 
    Tooltip,
    List, 
    ListItem, 
    ListItemSecondaryAction, 
    ListItemText,
    Modal,
    Checkbox, 
    Paper,
    FormControlLabel, 
} from '@material-ui/core';
import AVOMasteryGauge from '../MasteryGauge';
import {AvoLesson} from '../Learn';
import {ThemeObj} from '../../Models';
import {LooksOne, LooksTwo, Looks3, Looks4, Looks5, Close, Fullscreen} from '@material-ui/icons';
import * as Http from '../../Http';
import {Content} from '../../HelperFunctions/Content';
import InquiryPopup from './OrganicContentCreation/InquiryPopup';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {ShowSnackBar, SnackbarVariant} from "../../Layout/Layout";
import { BooleanLiteral } from '@babel/types';

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

interface LessonScreenProps {
    lesson: AvoLesson;
    disabled: boolean;
    theme: ThemeObj;
    next: () => void;
    survey: (mastery: number, aptitude: number) => () => void;
    closeFSM: () => void;
    showSnackBar: ShowSnackBar;
    organicContentEnabled: boolean;
}

interface LessonScreenState {
    inquiries: InquiryObject[];
    expanded: string;
    selectedInquiry: InquiryObject;
    isQuestionModalOpen: boolean;
};

const surveyIcons = [
    {'icon': LooksOne, 'understandTooltip': "I'm extremely confused", 'easyToolTip': 'I was unable to do it at all'},
    {'icon': LooksTwo, 'understandTooltip': "I didn't understand most of it", 'easyToolTip': "It was extremely hard"},
    {'icon': Looks3, 'understandTooltip': "I understood some of it", 'easyToolTip': "It was challenging but doable"},
    {'icon': Looks4, 'understandTooltip': "I understand most of it", 'easyToolTip': "It was not difficult"},
    {'icon': Looks5, 'understandTooltip': "Understand it completely", 'easyToolTip': "It was extremely easy"},
];

export class LessonScreen extends PureComponent<LessonScreenProps, LessonScreenState> {
    state: LessonScreenState = {
        inquiries: ([] as InquiryObject[]),
        expanded: 'panel1',
        selectedInquiry: ({} as InquiryObject),
        isQuestionModalOpen: false,
    }
    poller: any;

    render() {
        const {lesson, theme, disabled, next} = this.props;
        const {expanded} = this.state;
        return (
            <Fragment>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <ExpansionPanel 
                        expanded={expanded === 'panel1'} 
                        onChange={() => this.handleChange('panel1')} 
                        style={{ boxShadow: 'none' }}
                    >
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography variant={'h6'}>Lesson: {lesson.name}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <div style={{flex: 1, overflowY: 'auto', height: '55vh'}}>
                                <Content variant='body2'>{lesson.lesson}</Content>
                            </div>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel 
                        expanded={expanded === 'panel2'}
                        onChange={() => this.handleChange('panel2')} 
                        style={{ boxShadow: 'none' }}
                        disabled={!this.props.organicContentEnabled}
                    >
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel2bh-content"
                            id="panel2bh-header"
                        >
                            <Typography variant={'h6'}>Questions Asked</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails> 
                            {this.getInquiriesList()}
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                    }}
                >
                    <AVOMasteryGauge
                        comprehension={Math.floor(lesson.mastery * 100)}
                        theme={theme}
                    />
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Typography>How well do you understand it?</Typography>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            {/* Iterate over all the survey icon objects for the "How well do u understand it section" */}
                            {surveyIcons.map((surveyIcon, index) => {
                                const Icon = surveyIcon['icon'];
                                return (
                                    <Tooltip title={surveyIcon['understandTooltip']}>
                                        <IconButton
                                            color={
                                                index === lesson.masterySurvey - 1 ? 'primary' : 'default'
                                            }
                                            onClick={this.updateMastery(index + 1)}
                                        >
                                            <Icon/>
                                        </IconButton>
                                    </Tooltip>

                                )
                            })}
                        </div>
                        <Typography>How easy was it?</Typography>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            {/* Iterate over all the survey icon objects for the "How easy was it" section */}
                            {surveyIcons.map((surveyIcon, index) => {
                                const Icon = surveyIcon['icon'];
                                return (
                                    <Tooltip title={surveyIcon['easyToolTip']}>
                                        <IconButton
                                            color={
                                                index === lesson.aptitudeSurvey - 1 ? 'primary' : 'default'
                                            }
                                            onClick={this.updateAptitude(index + 1)}
                                        >
                                            <Icon/>
                                        </IconButton>
                                    </Tooltip>

                                )
                            })}
                        </div>
                    </div>
                    {this.props.organicContentEnabled && (
                        <InquiryPopup 
                            ID={lesson.conceptID} 
                            object={lesson.lesson} 
                            inquiries={this.state.inquiries} 
                            showSnackBar={this.props.showSnackBar} 
                            updateInquiryFunc={this.updateInquiries.bind(this)}
                        />
                    )}
                    {disabled ?
                        <Button id="finish-concept-lesson" variant='outlined' color='primary' onClick={this.finishLesson.bind(this)}>
                            Finish Lesson
                        </Button> 
                        :
                        <Button id="practice-concept" variant='outlined' color='primary' onClick={next}>
                            Practice Concept
                        </Button>
                    }
                </div>
                {this.getInquiryDetailModal()}
            </Fragment>
        );
    }

    componentDidMount() {
        this.getInquiries();
        this.poller = setInterval(this.getInquiries.bind(this), 1000 * 60 * 3);
    };

    componentWillUnmount() {
        clearInterval(this.poller);
    };

    getInquiriesList() {
        return (
            <List
                component='nav'
                style={{maxHeight: '50vh', overflowY: 'auto', width : '100%'}}
            >
                {this.state.inquiries.map(InquiryObject => { 
                    let inquiryString: string = `${(InquiryObject.editedInquiry.length > 0 ? InquiryObject.editedInquiry : InquiryObject.originalInquiry)}`;
                    return( 
                        <ListItem role={undefined} dense style={{ width : '100%' }}>
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
                                secondary={`${(new Date(InquiryObject.timeCreated)).toLocaleString("en-US")} ${InquiryObject.hasAnswered ? '(Answered)' : ''}`} 
                            />
                            <ListItemSecondaryAction>
                                <Tooltip title={'View Question/Answer'}>
                                    <IconButton onClick={() => this.openInquiry(InquiryObject)}>
                                        <Fullscreen color="primary"/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Subscibe to question">
                                    <Checkbox
                                        color="primary"
                                        onChange={() => {
                                            let copy = ([...this.state.inquiries] as InquiryObject[]);
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
                                            this.updateInquiries(copy);
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
                        <Typography variant={'body2'}>
                            No Questions available.
                        </Typography>
                    </div>
                )}
            </List>
        );
    };

    getInquiryDetailModal() {
        return (
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
        );
    };

    openInquiry(inquiry: InquiryObject) {
        this.setState({  
            isQuestionModalOpen : true,
            selectedInquiry: inquiry
        });
    };

    updateMastery = (mastery: number) => () => {
        Http.postQuestionSurvey(
            this.props.lesson.conceptID,
            mastery,
            this.props.lesson.aptitudeSurvey,
            this.props.survey(mastery, this.props.lesson.aptitudeSurvey),
            console.warn,
        );
    };

    handleChange(expanded: string) {
        // If expanded (state) is the same as expanded (argument), we are collapsing that section
        this.state.expanded === expanded ? this.setState({expanded: ''}) : this.setState({ expanded });
    };

    updateAptitude = (aptitude: number) => () => {
        Http.postQuestionSurvey(
            this.props.lesson.conceptID,
            this.props.lesson.masterySurvey,
            aptitude,
            this.props.survey(this.props.lesson.masterySurvey, aptitude),
            console.warn,
        );
    };

    updateInquiries(newInquiries: InquiryObject[]) {
        this.setState({ inquiries : newInquiries });
    };

    finishLesson() {
        Http.maxMastery(
            this.props.lesson.conceptID,
            (res: any) => {
                this.props.closeFSM();
            },
            (res: any) => {},
        );
    }

    subscribeToInquiry(inquiryID: number) {
        Http.subscribeToInquiry(
            inquiryID, 
            (res) => {
                
            }, 
            (res) => {
                this.props.showSnackBar('error', "Hmm it look it like there was an error subscribing... please try again in a couple minutes.", 1000);
            }
        );
    };

    unsubscribeToInquiry(inquiryID: number) {
        Http.unsubscribeToInquiry(
            inquiryID, 
            (res) => {

            }, 
            (res) => {
                this.props.showSnackBar('error', "Hmm it look it like there was an error unsubscribing... please try again in a couple minutes.", 1000);
            }
        );
    };

    getInquiries() {
        Http.getInquiries(
            this.props.lesson.conceptID,       
            1, // 1 refers to a concept, given that only concepts can have lessons this makes sense here ;p
            (res: InquiryObject[]) => { 
                this.setState({ inquiries: res });
            },
            (res: any) => { 
                console.log(res); 
            },
        );
    };
}
