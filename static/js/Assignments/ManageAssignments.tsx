import React, { Component } from 'react';
import { Grid, Paper, Select, Grow, MenuItem, ListItemText, Input, IconButton, Typography } from '@material-ui/core';
import {ChevronLeft, ChevronRight, Add} from '@material-ui/icons';
import * as Http from '../Http';
import {Course} from '../Http/types';
import {ThemeObj} from '../Models';
import AnswerFSM from '../InquiryAnswering/AnswerFSM';
import {ShowSnackBar} from '../Layout/Layout';
import Button from '@material-ui/core/Button';

interface ManageAssignmentsProps {
    theme: ThemeObj;
    showSnackBar: ShowSnackBar;
};

interface ManageAssignmentsState {
    hasLoadedConcepts: boolean;
    hasLoadedInquiriesForConcept: boolean;
    courses: Course[];
    selectedCourseName: string;
    selectedCourse: Course;
    currentIndex: number;
};

export default class ManageAssignments extends Component<ManageAssignmentsProps, ManageAssignmentsState> {
    pollFrequency: number;
    intervalObject: any;
    pageNum: number;

    constructor(props: ManageAssignmentsProps) {
        super(props);
        this.state = {
            hasLoadedConcepts: false,
            hasLoadedInquiriesForConcept: false,
            courses: [],
            selectedCourse: {} as Course,
            selectedCourseName: '',
            currentIndex: 0,
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
                            {/* {this.state.inquiredConcepts.filter((c: InquiredConcept, i: number) => {
                                return this.state.currentIndex * 6 <= i && (this.state.currentIndex * 6) + 6 >= i + 1;
                            }).map((InquiredConcept, i: number) => (
                                <div
                                    style={{ 
                                        padding : '4px',
                                        height: 'fit-content',
                                        cursor: 'pointer'
                                    }} 
                                    onClick={() => { 

                                    }}
                                    id={`concept@id:${InquiredConcept.ID}`}
                                    key={`concept@key:${i}`}
                                >
                                    <Grow in={this.state.hasLoadedConcepts} timeout={i * 150} key={`concept-anim@key:${i}`}>
                                        <Paper 
                                            className='avo-card' 
                                            style={{ 
                                                width: 'auto', 
                                                margin: '0px',
                                                height: '32vh',
                                                maxHeight: '500px',
                                            }}
                                        >
                                            <AnswerGauge 
                                                theme={this.props.theme} 
                                                answered={InquiredConcept.answered} 
                                                unanswered={InquiredConcept.unanswered}
                                                width={'auto'}
                                                height={'90%'}
                                            />
                                            <Typography variant="body1" style={{ position: 'absolute', bottom: '4px', left: '4px' }}>
                                                {InquiredConcept.name.length > 23 ? InquiredConcept.name.substring(0, 23) + '...' : InquiredConcept.name}
                                            </Typography>
                                        </Paper>
                                    </Grow>
                                </div>
                            ))} */}
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
                        Hello world
                    </div>
                </AnswerFSM>
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

    getSourceID() {
        // if(!!this.state.selectedInquiry.ID)
            // return `concept@id:${this.state.selectedInquiry.ID}`;

        return '69';
    };

    closeAnswerFSM() {

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
            hasLoadedConcepts : false,
        }, () => {
            setTimeout(() => {
                this.setState({ hasLoadedConcepts : true });
            }, 150 * 6)
        });
    };

    goToPrev() {
        const index: number = this.state.currentIndex - 1;
        this.setState({ 
            currentIndex : index,
            hasLoadedConcepts : false,
        }, () => {
            setTimeout(() => {
                this.setState({ hasLoadedConcepts : true });
            }, 150 * 6)
        });
    };

    changeClass = () => {
        const {selectedCourseName, courses} = this.state;
        if (selectedCourseName !== 'Select class...') {
            const selectedCourse = courses.find(c => c.name === selectedCourseName);
            if (selectedCourse) {
                this.setState({selectedCourse, hasLoadedConcepts:false, currentIndex: 0}, () => {
                    setTimeout(() => {  
                        this.getInquiredConcepts(selectedCourse.courseID);
                    }, 150 * 6)            
                });
            }
        }
    };

    getInquiredConcepts(courseID: number) {
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