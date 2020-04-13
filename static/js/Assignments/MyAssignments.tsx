import React, { Component } from 'react';
import { 
    Grid, 
    Paper, 
    Select, 
    Grow, 
    MenuItem, 
    Input, 
    IconButton, 
    Typography, 
    TextField, 
    Tooltip,
    List, 
    ListItem, 
    ListItemSecondaryAction, 
    ListItemText,
    Modal,
    Checkbox, 
} from '@material-ui/core';
import {ChevronLeft, ChevronRight, Add, Close, Fullscreen} from '@material-ui/icons';
import * as Http from '../Http';
import {Course} from '../Http/types';
import {ThemeObj} from '../Models';
import AnswerFSM from '../InquiryAnswering/AnswerFSM';
import {ShowSnackBar} from '../Layout/Layout';
import InquiryPopup from '../Learn/LearnModal/OrganicContentCreation/InquiryPopup';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Dropzone from 'react-dropzone-uploader'
import Button from '@material-ui/core/Button';
import {Content} from '../HelperFunctions/Content';
import {DateTimePicker} from '@material-ui/pickers';

import debounce from '../SharedComponents/AVODebouncer';

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

interface Assignment {
    COURSE: number;
    ID: number;
    content: string;
    dueDate: string;
    hasAssignment: boolean;
    name: string;
};

interface MyAssignmentsProps {
    theme: ThemeObj;
    showSnackBar: ShowSnackBar;
};

interface MyAssignmentsState {
    hasLoaded: boolean;
    hasLoadedInquiriesForConcept: boolean;
    courses: Course[];
    selectedCourseName: string;
    selectedCourse: Course;
    currentIndex: number;
    assignments: Assignment[];
    selectedAssignment: Assignment;
    inquiries: InquiryObject[];
    expanded: string;
    selectedInquiry: InquiryObject;
    isQuestionModalOpen: boolean;
};

export default class MyAssignments extends Component<MyAssignmentsProps, MyAssignmentsState> {
    pollFrequency: number;
    intervalObject: any;
    pageNum: number;

    constructor(props: MyAssignmentsProps) {
        super(props);
        this.state = {
            hasLoaded: false,
            hasLoadedInquiriesForConcept: false,
            courses: [],
            selectedCourse: {} as Course,
            selectedCourseName: '',
            currentIndex: 0,
            assignments: [],
            selectedAssignment: {} as Assignment,
            inquiries: ([] as InquiryObject[]),
            expanded: 'panel1',
            selectedInquiry: ({} as InquiryObject),
            isQuestionModalOpen: false,
        };

        this.pollFrequency = 1000 * 60 * 2;
        this.pageNum = 0;
    };

    render() {
        return (
            <div style={{ width : '100%', height:  '100%', position: 'relative' }}>
                <div style={{ margin : '8px', position : 'absolute', right: '12px' }}>
                    <Select
                        value={this.state.selectedCourseName}
                        input={<Input name='data' id='select-class'/>}
                        onChange={e =>
                            this.setState(
                                {selectedCourseName: e.target.value as string},
                                () => this.changeClass(),
                            )
                        }
                    >
                        {this.state.courses.map((c: Course, i: number) => (
                            <MenuItem
                                key={i}
                                value={c.name}
                            >
                                <ListItemText style={{float: 'left'}}>
                                    {c.name}
                                </ListItemText>
                            </MenuItem>
                        ))}
                    </Select>
                </div>
                <br/>
                <br/>
                <br/>
                <div style={{ width : '100%', height: '100%',  display: 'grid', gridTemplateColumns: '10% 80% 10%' }}>
                    <div>
                        <IconButton
                            color='primary'
                            style={{ 
                                float  : 'left', 
                                margin : '14px',
                                marginTop: '34vh' 
                            }}
                            disabled={this.isPrevDisabled()}
                            onClick={this.goToPrev.bind(this)}
                        >
                            <ChevronLeft/>
                        </IconButton>
                    </div>
                    <div>
                        <div 
                            style={{ 
                                width : '100%',  
                                display: 'grid', 
                                height:  '100%',
                                gridTemplateColumns: '33.33% 33.33% 33.33%', 
                                gridAutoRows: 'min-content'
                            }}
                        >
                            {this.state.assignments.filter((c: Assignment, i: number) => {
                                return this.state.currentIndex * 12 <= i && (this.state.currentIndex * 12) + 12 >= i + 1;
                            }).map((Assignment, i: number) => (
                                <div
                                    style={{ 
                                        padding : '4px',
                                        height: 'fit-content',
                                        cursor: 'pointer'
                                    }} 
                                    onClick={() => { 
                                        this.setState({ selectedAssignment : Assignment });
                                    }}
                                    id={`assignment@id:${Assignment.ID}`}
                                    key={`assignment@key:${i}`}
                                >
                                    <Grow in={this.state.hasLoaded} timeout={i * 150} key={`assignment-anim@key:${i}`}>
                                        <Paper 
                                            className='avo-card' 
                                            style={{ 
                                                width: 'auto', 
                                                margin: '0px',
                                                height: '16vh',
                                                maxHeight: '500px',
                                            }}
                                        >
                                            <Typography variant="body1" style={{ position: 'absolute', top: '4px', left: '4px' }}>
                                                {Assignment.name.length > 23 ? Assignment.name.substring(0, 23) + '...' : Assignment.name}
                                            </Typography>
                                            <Typography variant="caption" style={{ position: 'absolute', top: '24px', left: '4px' }}>
                                                {Assignment.dueDate}
                                            </Typography>
                                        </Paper>
                                    </Grow>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <IconButton 
                            color='primary'
                            style={{ 
                                float  : 'right', 
                                margin : '14px',
                                marginTop: '34vh' 
                            }}
                            disabled={this.isNextDisabled()}
                            onClick={this.goToNext.bind(this)}
                        >
                            <ChevronRight/>
                        </IconButton>
                    </div>
                </div>
                <AnswerFSM
                    sourceID={this.getSourceID()} 
                    onClose={this.closeAnswerFSM.bind(this)}
                    theme={this.props.theme}
                >
                    <div style={{ width: '-webkit-fill-available', position: 'relative' }}>
                        {this.renderAssignmentData()}
                    </div>
                </AnswerFSM>
            </div>
        );
    };

    renderAssignmentData() {
        const {expanded, selectedAssignment} = this.state;
        return (
            <>
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    width: '80%'
                }}>
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
                            <Typography variant={'h6'}>Lesson: {selectedAssignment.name}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <div style={{flex: 1, overflowY: 'auto', height: '55vh'}}>
                                <Content variant='body2'>{selectedAssignment.content}</Content>
                            </div>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel 
                        expanded={expanded === 'panel2'}
                        onChange={() => this.handleChange('panel2')} 
                        style={{ boxShadow: 'none' }}
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
                        position: 'absolute',
                        right: '10px',
                        bottom: '10px',
                        width: '20%'
                    }}
                >
                    <Dropzone
                        getUploadParams={({file, meta}: any) => {
                            // return {url: '/upload/assignment'}
                            const body = new FormData();
                            body.append('fileField', file);
                            body.append('lessonID', `${this.state.selectedAssignment.ID}`);
                            return { url: '/upload/assignment', body };
                        }}
                        onChangeStatus={({meta, file}: any, status: any) => {
                        }}
                        onSubmit={(files: any[]) => {
                            // this.getImages();
                        }}
                        accept=""
                    />
                    {/* <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', margin: 10}}>

                        {
                            Object.keys(this.state.images).map(key => {
                                const name = this.state.images[key];
                                return (
                                    <div key={`image_uploader_${key}`} id={`image_uploader_${key}`}>
                                        <Typography>{name}</Typography>
                                        <img alt={name} src={`${BASE_URL}/image/${name}`}/>
                                    </div>
                                )
                            })
                        }
                    </div> */}
                    <InquiryPopup 
                        ID={this.state.selectedAssignment.ID} 
                        type={2}
                        object={this.state.selectedAssignment.content} 
                        inquiries={this.state.inquiries} 
                        showSnackBar={this.props.showSnackBar} 
                        updateInquiryFunc={this.updateInquiries.bind(this)}
                    />
                </div>
                {this.getInquiryDetailModal()}
            </>
        );
    };

    updateInquiries(newInquiries: InquiryObject[]) {
        this.setState({ inquiries : newInquiries });
    };

    
    handleChange(expanded: string) {
        // If expanded (state) is the same as expanded (argument), we are collapsing that section
        this.state.expanded === expanded ? this.setState({expanded: ''}) : this.setState({ expanded });
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
            this.state.selectedAssignment.ID,       
            2, // 1 refers to a concept, given that only concepts can have lessons this makes sense here ;p
            (res: InquiryObject[]) => { 
                this.setState({ inquiries: res });
            },
            (res: any) => { 
                console.log(res); 
            },
        );
    };

    componentDidMount() {
        Http.getCourses(
            res => {
                const courses = res.courses;
                this.setState(
                    {
                        courses            : courses,
                        selectedCourse     : courses[0],
                        selectedCourseName : courses[0].name,
                    }, 
                    () => this.intervalObject = setInterval(() => this.getInquiredConcepts(this.state.selectedCourse.courseID), 1000 * 60 * 3)
                );
                this.getInquiredConcepts(courses[0].courseID);
            },
            err => {
                console.log(err);
            },
        );
    };

    componentWillUnmount() {
        clearInterval(this.intervalObject);
    };

    getSourceID() {
        if(!!this.state.selectedAssignment.ID)
            return `assignment@id:${this.state.selectedAssignment.ID}`;
    };

    closeAnswerFSM() {
        this.setState({ selectedAssignment : {} as Assignment });
    }

    isNextDisabled() {
        return this.state.currentIndex == this.pageNum - 1;
    };

    isPrevDisabled() {
        return this.state.currentIndex == 0;
    };

    goToNext() {
        const index: number = this.state.currentIndex + 1;
        this.setState({ 
            currentIndex : index,
            hasLoaded : false,
        }, () => {
            setTimeout(() => {
                this.setState({ hasLoaded : true });
            }, 150 * 6)
        });
    };

    goToPrev() {
        const index: number = this.state.currentIndex - 1;
        this.setState({ 
            currentIndex : index,
            hasLoaded : false,
        }, () => {
            setTimeout(() => {
                this.setState({ hasLoaded : true });
            }, 150 * 6) 
        });
    };

    changeClass = () => {
        const {selectedCourseName, courses} = this.state;
        if (selectedCourseName !== 'Select class...') {
            const selectedCourse = courses.find(c => c.name === selectedCourseName);
            if (selectedCourse) {
                this.setState({selectedCourse, hasLoaded:false, currentIndex: 0}, () => {
                    setTimeout(() => {   
                        this.getInquiredConcepts(selectedCourse.courseID);
                    }, 150 * 6)            
                });
            }
        }
    };

    getInquiredConcepts(courseID: number) {
        Http.getLessons(
            courseID,
            (res: any) => { 
                this.setState({ assignments: res.lessons, hasLoaded : true });
            },
            res => {
                console.log(res);
            }
        );
        // Http.getAllInquiredConcepts(
        //     courseID,
        //     (res: any) => {
        //         const concepts = (res.concepts as InquiredConcept[])
        //             .filter(InquiredConcept => InquiredConcept.answered + InquiredConcept.unanswered != 0)
        //         this.pageNum = concepts.length <= 6 ? 1 : Math.floor(concepts.length/6) + (concepts.length % 6 > 0 ? 1 : 0);
        //         this.setState({ 
        //             inquiredConcepts : concepts, 
        //             hasLoadedConcepts : true 
        //         });
        //     },
        //     () => {},
        // );
    };

};