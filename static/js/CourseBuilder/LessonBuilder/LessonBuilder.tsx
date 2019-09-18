import React, {Component, Fragment} from 'react';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    Input,
    Card,
    CardContent,
    CardActions,
    Typography,
} from '@material-ui/core';
import {Class} from '../../Models';
import * as Http from '../../Http';
import * as utils from '../../HelperFunctions/Utilities';
interface LessonBuilderProps {}
interface LessonBuilderState {}
export default class LessonBuilder extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedClassName: 'Select class...',
            classNames: [],
            classes: [],
            selectedClass: {} as Class,
            loadingClasses: true,
            selectedLesson: null,
            lessons: null,
            showAdd: false,
            tags: null,
            selectedTag: null,
            questions: [],
            addLessonText: '',
            editLessonText: '',
        };
    }
    componentDidMount() {
        this.getClasses();
    }

    render() {
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 25,
                }}
            >
                {this.state.loadingClasses && !this.state.lessons && (
                    <div className='avo-loading-icon'></div>
                )}
                {!this.state.loadingClasses && this.state.lessons && (
                    <Card
                        style={{
                            width: '100%',
                            margin: 0,
                            padding: 0,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto',
                        }}
                    >
                        <CardContent>
                            <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
                                <div style={{marginLeft: 'auto', paddingBottom: 15}}>
                                    <Select
                                        value={this.state.selectedClassName}
                                        input={<Input name='data' id='select-class' />}
                                        onChange={e =>
                                            this.setState(
                                                {selectedClassName: e.target.value as string},
                                                () => this.changeClass(),
                                            )
                                        }
                                    >
                                        {this.state.classNames.map((c: any, i: number) => (
                                            <MenuItem key={i} value={c}>
                                                {c}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                            {(!this.state.selectedLesson && !this.state.showAdd && (
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    {this.state.lessons.map((lesson: any) => (
                                        <Card
                                            onClick={() => {
                                                console.log(lesson);
                                                this.setState({
                                                    selectedLesson: lesson,
                                                    editLessonText: lesson.lesson.lessonString,
                                                });
                                            }}
                                            style={{margin: 25, padding: 25, cursor: 'pointer'}}
                                        >
                                            <Typography>{ ((this.state.tags || []).find((tag: any) => tag.tagID === lesson.lesson.TAG) || {tagName: "None"}).tagName }</Typography>
                                            <CardContent>
                                                {utils.getMathJax(lesson.lesson.lessonString)}
                                            </CardContent>
                                            <Typography>Questions</Typography>
                                            <CardActions>
                                                {lesson.questions
                                                    .filter((q: any) =>
                                                        lesson.lesson.questionList.find(
                                                            (q2: any) => q2 === q.QUESTION,
                                                        ),
                                                    )
                                                    .map((question: any) => (
                                                        <Button
                                                            disabled
                                                            variant='outlined'
                                                            style={{borderRadius: '2.5em'}}
                                                        >
                                                            {question.name}
                                                        </Button>
                                                    ))}
                                            </CardActions>
                                        </Card>
                                    ))}
                                    <Button
                                        onClick={() => {
                                            this.setState({showAdd: true});
                                            const blankLesson = {
                                                lesson: {
                                                    CLASS: this.state.selectedClass.classID,
                                                    LESSON: null,
                                                    TAG: null,
                                                    lessonString: '',
                                                    questionList: [],
                                                },
                                                questions: [],
                                            };
                                            this.setState({selectedLesson: blankLesson});
                                        }}
                                        variant='outlined'
                                        style={{borderRadius: '2.5em'}}
                                    >
                                        Add Lesson
                                    </Button>
                                </div>
                            )) ||
                                (this.state.selectedLesson && !this.state.showAdd && (
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <Button
                                            variant='outlined'
                                            onClick={() =>
                                                this.deleteLesson(
                                                    this.state.selectedLesson.lesson.LESSON,
                                                )
                                            }
                                            style={{marginLeft: 'auto'}}
                                        >
                                            Delete
                                        </Button>
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <div style={{flex: '1'}}>
                                                <TextField
                                                    id='filled-full-width'
                                                    label='Enter lesson content...'
                                                    fullWidth
                                                    margin='normal'
                                                    variant='filled'
                                                    multiline={true}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    value={this.state.editLessonText}
                                                    onChange={(e: any) =>
                                                        this.setState({editLessonText: e.target.value})
                                                    }
                                                    rows={20}
                                                />
                                            </div>
                                            <div style={{flex: '1', marginTop: 16, marginBottom: 8}}>
                                                    <Card style={{height: '100%'}}>
                                                        <CardContent>
                                                            <Typography>{utils.getMathJax(this.state.editLessonText)}</Typography>
                                                        </CardContent>
                                                    </Card>
                                            </div>
                                        
                                        </div>
                                        <Typography>Questions:</Typography>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {this.state.selectedLesson.questions.map(
                                                (question: any) => (
                                                    <Button
                                                        onClick={() =>
                                                            this.toggleQuestion(question.QUESTION)
                                                        }
                                                        variant={
                                                            this.state.selectedLesson.lesson.questionList.find(
                                                                (q: number) =>
                                                                    question.QUESTION === q,
                                                            )
                                                                ? 'contained'
                                                                : 'outlined'
                                                        }
                                                        style={{borderRadius: '2.5em'}}
                                                    >
                                                        {question.name}
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                        <Button
                                            onClick={this.saveLesson}
                                            variant='outlined'
                                            style={{borderRadius: '2.5em'}}
                                        >
                                            Save Lesson
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                this.setState({selectedLesson: null});
                                                this.fetchLessons();
                                            }}
                                            variant='outlined'
                                            style={{borderRadius: '2.5em'}}
                                        >
                                            Go back
                                        </Button>
                                    </div>
                                )) || (
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <div style={{flex: '1'}}>
                                                <TextField
                                                    id='filled-full-width'
                                                    label='Enter lesson content...'
                                                    fullWidth
                                                    margin='normal'
                                                    variant='filled'
                                                    multiline={true}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    value={this.state.addLessonText}
                                                    onChange={(e: any) =>
                                                        this.setState({addLessonText: e.target.value})
                                                    }
                                                    rows={20}
                                                />
                                            </div>
                                            <div style={{flex: '1', marginTop: 16, marginBottom: 8}}>
                                                    <Card style={{height: '100%'}}>
                                                        <CardContent>
                                                            <Typography>{utils.getMathJax(this.state.addLessonText)}</Typography>
                                                        </CardContent>
                                                    </Card>
                                            </div>
                                        
                                        </div>
                                        <br />
                                        <Typography>Concepts (select 1)</Typography>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {this.state.tags &&
                                                this.state.tags.map((tag: any) => (
                                                    <Button
                                                        onClick={() => {
                                                            console.log(tag);
                                                            this.setState({selectedTag: tag});
                                                        }}
                                                        variant={
                                                            this.state.selectedTag &&
                                                            this.state.selectedTag.tagID ===
                                                                tag.tagID
                                                                ? 'contained'
                                                                : 'outlined'
                                                        }
                                                        style={{borderRadius: '2.5em'}}
                                                    >
                                                        {tag.tagName}
                                                    </Button>
                                                ))}
                                        </div>
                                        <br />
                                        <Typography>
                                            Questions (select as many as you want)
                                        </Typography>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {this.state.questions &&
                                                this.state.selectedLesson &&
                                                this.state.questions
                                                    .filter(
                                                        (question: any) =>
                                                            question.TAG ===
                                                            this.state.selectedTag.tagID,
                                                    )
                                                    .map((question: any) => (
                                                        <Button
                                                            onClick={() =>
                                                                this.toggleQuestion(
                                                                    question.QUESTION,
                                                                )
                                                            }
                                                            variant={
                                                                this.state.selectedLesson.lesson.questionList.find(
                                                                    (q: number) =>
                                                                        question.QUESTION === q,
                                                                )
                                                                    ? 'contained'
                                                                    : 'outlined'
                                                            }
                                                            style={{borderRadius: '2.5em'}}
                                                        >
                                                            {question.name}
                                                        </Button>
                                                    ))}
                                        </div>
                                        <br />

                                        <Button
                                            onClick={this.addLesson}
                                            variant='outlined'
                                            style={{borderRadius: '2.5em'}}
                                        >
                                            Add Lesson
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                this.setState({
                                                    showAdd: false,
                                                    selectedLesson: null,
                                                });
                                                this.fetchLessons();
                                            }}
                                            variant='outlined'
                                            style={{borderRadius: '2.5em'}}
                                        >
                                            Go back
                                        </Button>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    getClasses() {
        Http.getClasses(
            res => {
                console.log(res);
                const classes = res.classes;
                if (classes.length > 0) {
                    this.setState(
                        {
                            classNames: classes.map(c => c.name),
                            classes,
                            selectedClass: classes[0],
                            selectedClassName: classes[0].name,
                            loadingClasses: false,
                        },
                        () => this.changeClass(),
                    );
                }
            },
            err => {
                console.log(err);
            },
        );
    }

    changeClass = () => {
        const {selectedClassName, classes} = this.state;
        if (selectedClassName !== 'Select class...') {
            const selectedClass = classes.find((c: Class) => c.name === selectedClassName);
            if (selectedClass) {
                this.setState(
                    {selectedClass, selectedLesson: null, lessons: null, showAdd: false},
                    () => {
                        console.log(selectedClass);
                        Http.getLessonsToEdit(
                            selectedClass.classID,
                            (res: any) => {
                                console.log(res);
                                res.lessons.forEach((lesson: any, i: number) => {
                                    res.lessons[i].lesson.questionList = JSON.parse(
                                        lesson.lesson.questionList,
                                    );
                                });
                                console.log(res.lessons);
                                this.setState({lessons: res.lessons});
                            },
                            err => console.warn,
                        );
                        Http.getTags(
                            selectedClass.classID,
                            (res: any) => {
                                console.log(res);
                                res.tags = res.tags.filter(
                                    (tag: any) => tag.tagName !== selectedClass.name,
                                );
                                if (res.tags.length > 0) {
                                    this.setState({selectedTag: res.tags[0]});
                                }
                                this.setState({tags: res.tags});
                                Http.getQuestionsForLessons(
                                    res.tags.map((tag: any) => tag.tagID),
                                    (res: any) => {
                                        console.log(res);
                                        this.setState({questions: res.questions});
                                    },
                                    err => console.warn,
                                );
                            },
                            err => console.warn,
                        );
                    },
                );
            }
        }
    };

    addLesson = () => {
        const {selectedTag, addLessonText} = this.state;
        const selectedLesson = this.state.selectedLesson.lesson;
        console.log(selectedLesson);
        console.log(selectedTag);
        Http.addLesson(
            selectedLesson.CLASS,
            selectedTag.tagID,
            JSON.stringify(selectedLesson.questionList),
            addLessonText,
            res => {
                this.setState({
                    showAdd: false,
                    selectedLesson: null,
                    addLessonText: '',
                });
                this.fetchLessons();
                console.log(res);
            },
            err => console.warn,
        );
    };

    saveLesson = () => {
        console.log(this.state.selectedLesson);
        const selectedLesson = this.state.selectedLesson.lesson;
        Http.editLesson(
            selectedLesson.LESSON,
            selectedLesson.CLASS,
            selectedLesson.TAG,
            JSON.stringify(selectedLesson.questionList),
            this.state.editLessonText,
            res => {
                this.fetchLessons();
                console.log(res);
            },
            err => console.warn,
        );
    };

    toggleQuestion = (question: number) => {
        const selectedLesson = this.state.selectedLesson;
        const {questionList} = selectedLesson.lesson;
        if (questionList.find((q: number) => q === question)) {
            selectedLesson.lesson.questionList = questionList.filter((q: number) => q !== question);
            this.setState({selectedLesson});
        } else {
            selectedLesson.lesson.questionList = questionList.concat(question);
            this.setState({selectedLesson});
        }
    };

    deleteLesson = (LESSON: number) => {
        Http.deleteLesson(
            LESSON,
            res => {
                console.log(res);
                this.fetchLessons();
            },
            err => console.warn,
        );
    };

    fetchLessons = () => {
        const {selectedClassName, classes} = this.state;
        const selectedClass = classes.find((c: Class) => c.name === selectedClassName);
        Http.getLessonsToEdit(
            selectedClass.classID,
            (res: any) => {
                console.log(res);
                res.lessons.forEach((lesson: any, i: number) => {
                    res.lessons[i].lesson.questionList = JSON.parse(lesson.lesson.questionList);
                });
                console.log(res.lessons);
                this.setState({lessons: res.lessons, selectedLesson: null});
            },
            err => console.warn,
        );
    };
}
