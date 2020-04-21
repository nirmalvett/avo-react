import React, {Component, Suspense} from 'react';
import * as Http from '../Http';

const HomePage = React.lazy(() => import('../Home/HomePage'));
const TagView = React.lazy(() => import('../ConceptBuilder/TagView'));
const PostTest = React.lazy(() => import('../SharedComponents/PostTest'));
const MarkEditor = React.lazy(() => import('../ManageClasses/MarkEditor'));
const TakeTest = React.lazy(() => import('../MyClasses/TakeTest'));
const MyClasses = React.lazy(() => import('../MyClasses/MyClasses'));
const CreateTest = React.lazy(() => import('../ManageClasses/CreateTest/CreateTest'));
const AnswerInquiries = React.lazy(() => import('../InquiryAnswering/AnswerInquiries'));
const Preferences = React.lazy(() => import('../Preferences/Preferences'));
const ManageClasses = React.lazy(() => import('../ManageClasses/ManageClasses'));
const QuestionBuilderDocs = React.lazy(() => import('../QuestionBuilder/QuestionBuilderDocs'));
const ExportTools = React.lazy(() => import('../ExportTools/ExportTools'));
const Learn = React.lazy(() => import('../Learn/Learn'));
const MasteryHome = React.lazy(() => import('../Mastery/MasteryHome'));
const NotifyClass = React.lazy(() => import('../Home/NotifyClass'));
const Whitelist = React.lazy(() => import('../Whitelist/Whitelist'));
const QuestionBuilderHome = React.lazy(() => import('../QuestionBuilder/QuestionBuilderHome'));
const Feedback = React.lazy(() => import('../Feedback/Feedback'));
const ImageUploader = React.lazy(() => import('../ImageUploader/ImageUploader'));
const OpenCourses = React.lazy(() => import('../OpenCourses/OpenCourses'));
const Profile = React.lazy(() => import('../Profile/Profile'));
const ManageAssignments = React.lazy(() => import('../Assignments/ManageAssignments'));
const MyAssignments = React.lazy(() => import('../Assignments/MyAssignments'));

import AvoSideBar from './AvoSidebar';
import AvoAppBar from './AvoAppBar';
import AvoSnackBar from './AvoSnackBar';


import {colorList} from '../SharedComponents/AVOCustomColors';
import {createStyles, Theme} from '@material-ui/core/styles';
import {withStyles} from '@material-ui/core';
import classNames from 'classnames';
import {Section} from './LayoutModels';
import {Course, QuestionSet} from '../Http/types';
import {GetSections_Section} from '../Http';
import {HashLoader} from "react-spinners";

const drawerWidth = 240;

const styles = (theme: Theme) =>
    createStyles({
        content: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeIn,
                duration: theme.transitions.duration.leavingScreen,
            }),
            display: 'flex',
            flex: 1,
            marginTop: '64px',
            marginLeft: -drawerWidth,
        },
        contentShift: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        },
    });

export type SnackbarVariant = 'success' | 'warning' | 'error' | 'info';

interface LayoutProps {
    classes: {
        content: string;
        contentShift: string;
    };
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: 'dark' | 'light';
    logout: () => void;
    setColor: (color: number) => () => void;
    setTheme: (theme: 'light' | 'dark') => () => void;
    initialSection?: Section
}

interface LayoutState {
    section: Section;
    open: boolean;
    snackbar: {
        hideDuration: number;
        isOpen: boolean;
        message: string;
        variant: SnackbarVariant;
    };
    courses: Course[];
    sections: Http.GetSections_Section[];
    questionSets: QuestionSet[];
}

export type ShowSnackBar = (
    variant: SnackbarVariant,
    message: string,
    hideDuration: number,
) => void;

class Layout extends Component<LayoutProps, LayoutState> {
    constructor(props: LayoutProps) {
        super(props);
        const {initialSection} = this.props;
        this.state = {
            section: initialSection || {name: 'Learn'},
            open: true,
            snackbar: {
                hideDuration: 0,
                isOpen: false,
                message: '',
                variant: 'success',
            },
            courses: [],
            sections: [],
            questionSets: [],
        };
    }

    componentDidMount() {
        Http.getCourses(x => this.setState(x), console.warn);
        Http.getSections(x => this.setState(x), console.warn);
        Http.getSets(x => this.setState({questionSets: x.sets}), console.warn);
    }

    updateCourses = (courses: Course[], cb: () => void = () => undefined) =>
        this.setState({courses}, cb);

    updateSections = (sections: GetSections_Section[], cb: () => void = () => undefined) =>
        this.setState({sections}, cb);

    updateQuestionSets = (questionSets: QuestionSet[], cb: () => void = () => undefined) =>
        this.setState({questionSets}, cb);

    color = () => colorList[this.props.color];

    render() {
        const {classes, theme} = this.props;
        const open = this.state.open;
        return (
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme === 'dark' ? '#303030' : '#fcfcfc',
                }}
            >
                <AvoSideBar
                    isTeacher={this.props.isTeacher}
                    isAdmin={this.props.isAdmin}
                    color={this.color()}
                    theme={this.props.theme}
                    section={this.state.section}
                    open={this.state.open}
                    logout={this.props.logout}
                    onClick={(section: Section) => {
                        this.setState({section});
                        Http.collectData(
                            'change screen',
                            {section: section.name},
                            () => {
                            },
                            console.warn
                        );
                    }}
                />

                <AvoAppBar
                    section={this.state.section}
                    name={`${this.props.firstName} ${this.props.lastName}`}
                    open={this.state.open}
                    toggleDrawer={() => this.setState({open: !open})}
                    showSnackBar={this.showSnackBar}
                />

                <div
                    className={classNames(classes.content, {
                        [classes.contentShift]: open,
                    })}
                >
                    {this.getContent()}
                </div>
                <AvoSnackBar {...this.state.snackbar} onClose={this.closeSnackbar}/>
            </div>
        );
    }

    closeSnackbar = () => {
        const {hideDuration, variant, message} = this.state.snackbar;
        this.setState({snackbar: {hideDuration, variant, message, isOpen: false}});
    };

    // ============================== Methods that return parts of what is rendered ==========================

    getContent() {
        // this helper returns the logic for what is loaded in the right side of the menu
        return <Suspense fallback={this.loading()}>{this.renderContent()}</Suspense>
    }

    renderContent = () => {
        const {isTeacher, color, theme} = this.props;
        const {section} = this.state;
        if (section.name === 'Add Students') {
            return <Whitelist color={this.color()}/>;
        } else if (section.name === 'Concept Builder') {
            return <TagView theme={{theme: this.props.theme, color: this.color()}}/>;
        } else if (section.name === 'Create Test') {
            return (
                <CreateTest
                    showSnackBar={this.showSnackBar}
                    classID={section.classID}
                    onCreate={this.manageClasses}
                />
            );
        } else if (section.name === 'Documentation') {
            return <QuestionBuilderDocs/>;
        } else if (section.name === 'Export Tools') {
            return (
                <ExportTools
                    sections={this.state.sections}
                    updateSections={this.updateSections}
                    color={this.color()}
                />
            );
        } else if (section.name === 'Feedback') {
            return <Feedback/>;
        } else if (section.name === 'Home') {
            return (
                <HomePage
                    jumpToClass={this.jumpToClass.bind(this)}
                    jumpToSet={this.jumpToSet.bind(this)}
                    color={this.color()}
                    showSnackBar={this.showSnackBar}
                />
            );
            // return <HomePageOld showSnackBar={this.showSnackBar} />;
        } else if (section.name === 'Learn') {
            return (
                <Learn
                    courses={this.state.courses}
                    updateCourses={this.updateCourses}
                    theme={{theme: this.props.theme, color: this.color()}}
                    showSnackBar={this.showSnackBar}
                />
            );
        } else if (section.name === 'Manage Classes') {
            return (
                <ManageClasses
                    courses={this.state.courses}
                    sections={this.state.sections}
                    getCourses={() => Http.getCourses(x => this.setState(x), console.warn)}
                    updateSections={this.updateSections}
                    showSnackBar={this.showSnackBar}
                    createTest={this.createTest}
                    theme={{theme: this.props.theme, color: this.color()}}
                    postTest={this.postTest}
                    markEditor={this.markEditor}
                />
            );
        } else if (section.name === 'Mark Editor') {
            return <MarkEditor showSnackBar={this.showSnackBar} takes={section.takesID}/>;
        } else if (section.name === 'Mastery') {
            return <MasteryHome theme={{theme: this.props.theme, color: this.color()}}/>;
        } else if (section.name === 'My Classes') {
            return (
                <MyClasses
                    sections={this.state.sections}
                    updateSections={this.updateSections}
                    classToJumpTo={section._class}
                    setToJumpTo={section._quiz}
                    showSnackBar={this.showSnackBar}
                    isTeacher={isTeacher}
                    startTest={this.takeTest}
                    theme={{theme: this.props.theme, color: this.color()}}
                    postTest={this.postTest}
                />
            );
        } else if (section.name === 'My Questions') {
            return (
                <QuestionBuilderHome
                    showSnackBar={this.showSnackBar}
                    sets={this.state.questionSets}
                    updateSets={this.updateQuestionSets}
                    theme={this.props.theme}
                    courses={this.state.courses}
                />
            );
        } else if (section.name === 'Answer Inquiries') {
            return <AnswerInquiries theme={{theme: this.props.theme, color: this.color()}}
                                    showSnackBar={this.showSnackBar}/>
        } else if (section.name === 'Manage Assignments') {
            return <ManageAssignments theme={{theme: this.props.theme, color: this.color()}}
                                    showSnackBar={this.showSnackBar}/>
        } else if (section.name === 'My Assignments') {
            return <MyAssignments theme={{theme: this.props.theme, color: this.color()}}
                                    showSnackBar={this.showSnackBar}/>
        } else if (section.name === 'Notify Class') {
            return <NotifyClass/>;
        } else if (section.name === 'Post Test') {
            return <PostTest takes={section.takesID}/>;
        } else if (section.name === 'Preferences') {
            return (
                <Preferences
                    color={color}
                    theme={theme}
                    setColor={this.props.setColor}
                    setTheme={this.props.setTheme}
                    showSnackBar={this.showSnackBar}
                />
            );
        } else if (section.name === 'Take Test') {
            return (
                <TakeTest
                    showSnackBar={this.showSnackBar}
                    test={section.test}
                    submitTest={this.postTest}
                />
            );
        } else if (section.name === 'Upload Images') {
            return <ImageUploader showCard={true}/>
        }
        else if (section.name === 'Open Courses') {
            return <OpenCourses color={this.color()}/>
        }
        else if (section.name === 'Profile') {
            return <Profile color={this.color()}/>
        }
    };

    // ============================== Methods that perform some type of data manipulation =======================

    navigate(section: Section) {
        this.setState({section});
    }

    createTest = (classID: number) => this.navigate({name: 'Create Test', classID});

    manageClasses = () => this.navigate({name: 'Manage Classes'});

    markEditor = (takesID: number) => this.navigate({name: 'Mark Editor', takesID});

    jumpToSet = (_class: number, _quiz: number) =>
        this.navigate({name: 'My Classes', _class, _quiz});

    jumpToClass = (_class: number) => this.navigate({name: 'My Classes', _class, _quiz: null});

    myQuestions = () => this.navigate({name: 'My Questions'});

    postTest = (takesID: number) => this.navigate({name: 'Post Test', takesID});

    takeTest = (test: Http.GetSections_Test) => {
        Http.getTest(
            test.testID,
            test => {
                Http.collectData(
                    'take test my classes',
                    {test},
                    () => {
                    },
                    console.warn
                );
                this.setState({section: {name: 'Take Test', test}});
            },
            result => alert(result.error),
        );
    };

    showSnackBar = (variant: SnackbarVariant, message: string, hideDuration: number): void => {
        /**
         * @param variant can be success, warning, error, info
         * @param message is the message to display
         * @param hideDuration is optional but it's the ms for the snackbar to show
         **/
        this.setState({
            snackbar: {
                variant,
                message,
                hideDuration: hideDuration || 5000,
                isOpen: true,
            },
        });
    };

    loading() {
        return (
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <HashLoader size={150} color='#399103'/>
            </div>
        )
    }
}

export default withStyles(styles)(Layout);
