import React, { Component } from 'react';
import { Grid, Paper, Select, Grow, MenuItem, ListItemText, Input, IconButton, Typography, TextField, List, ListItem, ListItemSecondaryAction  } from '@material-ui/core';
import {ChevronLeft, ChevronRight, Add, CloudDownloadOutlined, Delete} from '@material-ui/icons';
import * as Http from '../Http';
import {Course} from '../Http/types';
import {ThemeObj} from '../Models';
import AnswerFSM from '../InquiryAnswering/AnswerFSM';
import {ShowSnackBar} from '../Layout/Layout';
import Button from '@material-ui/core/Button';
import {Content} from '../HelperFunctions/Content';
import {DateTimePicker} from '@material-ui/pickers';

import debounce from '../SharedComponents/AVODebouncer';

interface Assignment {
    COURSE: number;
    ID: number;
    content: string;
    dueDate: string;
    hasAssignment: boolean;
    name: string;
};

interface HandedInAssignment {
    ASSIGNMENT: number;
    USER: string;
    file: string;
};

interface ManageAssignmentsProps {
    theme: ThemeObj;
    showSnackBar: ShowSnackBar;
};

interface ManageAssignmentsState {
    hasLoaded: boolean;
    hasLoadedInquiriesForConcept: boolean;
    courses: Course[];
    selectedCourseName: string;
    selectedCourse: Course;
    currentIndex: number;
    isCreatingAssignment: boolean;
    lessonText: string;
    newLessonDate: Date;
    newLessonName: string;
    assignments: Assignment[];
    selectedAssignment: Assignment;
    handedInAssignments: HandedInAssignment[];
};

export default class ManageAssignments extends Component<ManageAssignmentsProps, ManageAssignmentsState> {
    pollFrequency: number;
    intervalObject: any;
    pageNum: number;

    constructor(props: ManageAssignmentsProps) {
        super(props);
        this.state = {
            hasLoaded: false,
            hasLoadedInquiriesForConcept: false,
            courses: [],
            selectedCourse: {} as Course,
            selectedCourseName: '',
            currentIndex: 0,
            isCreatingAssignment: false,
            lessonText: '',
            newLessonDate: new Date(),
            newLessonName: '',
            assignments: [],
            selectedAssignment: {} as Assignment,
            handedInAssignments: [],
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
                                        this.setState({ selectedAssignment : Assignment }, () => {
                                            this.getAssignments();
                                        });
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
                                            <IconButton
                                                style={{ position : 'absolute', right : '9px', bottom : '9px' }}
                                                onClick={(e: any) => {
                                                    e.stopPropagation();
                                                    this.deleteAssignment(Assignment.ID);
                                                }
                                            }>
                                                <Delete/>
                                            </IconButton>
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
                <div style={{ position: 'absolute', bottom: '18px', right: '18px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        className="avo-button"
                        id="add_assignment_button"
                        onClick={() => this.setState({ isCreatingAssignment: true })}
                    >
                        <span style={{ color: 'white' }}>
                            Add Assignment
                            <Add style={{ position: 'relative', top: '4px' }}/>
                        </span>
                    </Button>
                </div>
                <AnswerFSM
                    sourceID={this.getSourceID()} 
                    onClose={this.closeAnswerFSM.bind(this)}
                    theme={this.props.theme}
                >
                    <div>
                        <Typography variant="h4">
                            {this.state.selectedAssignment.name}
                        </Typography>
                        {!!this.state.handedInAssignments.length ? (
                            <List style={{ width: '60vw', height : '90%', overflowY: 'auto' }}>
                                {this.state.handedInAssignments.map(HandedInAssignment => (
                                    <ListItem dense>
                                        <ListItemText>{HandedInAssignment.USER}</ListItemText>
                                        <ListItemSecondaryAction>
                                            <IconButton size={'small'} onClick={() => window.open(`/assignment/${HandedInAssignment.file}`)}>
                                                <CloudDownloadOutlined/>
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body1" style={{ textAlign : 'center' }}>
                                No Assignments have been handed in yet.
                            </Typography>
                        )}
                    </div>
                </AnswerFSM>
                <AnswerFSM
                    sourceID={this.state.isCreatingAssignment ? "add_assignment_button" : undefined} 
                    onClose={this.closeAddAssignmentFSM.bind(this)}
                    theme={this.props.theme}
                >
                    {this.renderLessonCreation()}
                </AnswerFSM>
            </div>
        );
    };

    renderLessonCreation() {
        const lessonChangeDebouncer = debounce({
            callback: (e: any) => this.setState({lessonText: e.target.value}),
            wait: 1000,
            immediate: false,
        });
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    position: 'relative',
                    height: '40vh',
                    width: '-webkit-fill-available',
                }}
            >
                <Grid
                    container
                    style={{height: '60vh', position: 'relative'}}
                >
                    <Grid item md={12} >
                        <Input
                            id='set-lesson_name'
                            value={this.state.newLessonName}
                            placeholder="Lesson Name"
                            style={{ width : '300px' }}
                            onChange={e => this.setState({newLessonName: e.target.value})}
                        />
                    </Grid>
                    <Grid item md={6} style={{padding: '9px'}}>
                        <TextField
                            label='Lesson Content'
                            variant='outlined'
                            multiline
                            defaultValue={this.state.lessonText}
                            onChange={(e: any) => {
                                e.persist();
                                lessonChangeDebouncer(e);
                            }}
                            style={{
                                height: '-webkit-fill-available',
                                width: '-webkit-fill-available',
                            }}
                            margin='dense'
                            rows='20'
                        />
                    </Grid>
                    <Grid item md={6} style={{padding: '9px', height: '29vh', overflow: 'auto'}}>
                        <Content>{this.state.lessonText}</Content>
                    </Grid>
                    <Grid item md={12} >
                        <DateTimePicker
                            variant="inline"
                            format="MM/DD/YYYY"
                            margin="normal"
                            id="date-picker-inline"
                            label="Due Date"
                            value={this.state.newLessonDate}
                            onChange={(e: any) => { this.setState({ newLessonDate : new Date(e._d) }); }}
                        />
                    </Grid>
                    <Grid item md={12} >
                        <Button
                            variant="contained"
                            color="primary"
                            className="avo-button"
                            id="create_assignment_button"
                            onClick={() => this.addNewAssignment()}
                        >
                            <span style={{ color: 'white' }}>
                                Create Assignment
                            </span>
                        </Button>
                    </Grid>
                </Grid>
            </div>
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

    addNewAssignment() {
        const { lessonText, newLessonName, newLessonDate } = this.state;
        Http.addLesson(
            this.state.selectedCourse.courseID,
            newLessonName,
            lessonText,  
            true,
            newLessonDate.getTime(),
            res => {
                this.getInquiredConcepts(this.state.selectedCourse.courseID);
                this.closeAddAssignmentFSM();
            },
            res => {
                console.log(res);
            }
        );
    };

    getSourceID() {
        if(!!this.state.selectedAssignment.ID)
            return `assignment@id:${this.state.selectedAssignment.ID}`;
    };

    closeAnswerFSM() {
        this.setState({ selectedAssignment : {} as Assignment });
    }

    closeAddAssignmentFSM() {
        this.setState({ isCreatingAssignment : false });
    };

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

    getAssignments() {
        Http.getAssignments(
            this.state.selectedAssignment.ID,
            (res: any) => {
                this.setState({ handedInAssignments : res.assignments });
            },
            (res: any) => {
                console.log(res);
            }
        );
    };

    deleteAssignment(assignmentID: number) {
        Http.deleteLesson(
            assignmentID,
            (res: any) => {
                this.getInquiredConcepts(this.state.selectedCourse.courseID);
            },
            (res: any) => {

            },
        )
    }

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