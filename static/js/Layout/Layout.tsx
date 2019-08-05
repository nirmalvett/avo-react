import React, {Component} from 'react';
import Http, {TestResponse} from '../HelperFunctions/Http';
import HomePage from '../Home/HomePage';
import TagView from '../CourseBuilder/TagBuilder/TagView';
import PostTest from '../SharedComponents/PostTest';
import MarkEditor from '../ManageClasses/MarkEditor';
import TakeTest from '../MyClasses/TakeTest';
import MyClasses from '../MyClasses/MyClasses';
import CreateTest from '../ManageClasses/CreateTest/CreateTest';
import Preferences from '../Preferences/Preferences';
import ManageClasses from '../ManageClasses/ManageClasses';
import QuestionManager from '../CourseBuilder/QuestionBuilder/QuestionManager';
import QuestionBuilder from '../QuestionBuilder/QuestionBuilder';
import QuestionBuilderDocs from '../CourseBuilder/QuestionBuilder/QuestionBuilderDocs';
import AVOInClassTools from '../MISC/AVOInClassTools/AVOInClassTools';
import AVOExplanations from '../MISC/AVOExplanations/AVOExplanations';
import ExportTools from '../ExportTools/ExportTools';
import {colorList} from '../SharedComponents/AVOCustomColors';
import {MuiThemeProvider, createMuiTheme, createStyles, Theme} from '@material-ui/core/styles';
import NotifyClass from '../Home/NotifyClass';
import {withStyles} from '@material-ui/core';
import classNames from 'classnames';
import AvoSideBar from './AvoSidebar';
import AvoAppBar from './AvoAppBar';
import AvoSnackBar from './AvoSnackBar';
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

interface LayoutProps {
    classes: LayoutClasses;
    firstName: string;
    lastName: string;
    isTeacher: boolean;
    isAdmin: boolean;
    color: number;
    theme: 'dark' | 'light';
    logout: () => void;
    setColor: (color: number) => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

export type Section =
    | 'Build Question'
    | 'Create Test'
    | 'Documentation'
    | 'Explanations'
    | 'Export Tools'
    | 'Home'
    | 'In Class Tools'
    | 'Manage Classes'
    | 'Mark Editor'
    | 'My Classes'
    | 'My Questions'
    | 'Post Test'
    | 'Preferences'
    | 'Tag Builder'
    | 'Take Test';

interface LayoutState {
    section: Section;
    open: boolean;
    testCreator: null | number;
    postTest: null | number;
    markEditor: null | number;
    minutesRemainingUponResumingTest: null | number;
    testDueDate: null | number;
    questionManager: [null, null, []];
    classToJumpTo: null | number;
    setToJumpTo: null | number;
    snackbar: {
        hideDuration: number;
        isOpen: boolean;
        message: string;
        variant: SnackbarVariant;
    };
    test: (TestResponse & {newAnswers: string[][]}) | undefined;
}

export type SnackbarVariant = 'success' | 'warning' | 'error' | 'info';

interface LayoutClasses {
    content: string;
    contentShift: string;
}

class Layout extends Component<LayoutProps, LayoutState> {
    constructor(props: LayoutProps) {
        super(props);
        this.state = {
            test: undefined,
            section: 'Home',
            open: true,
            testCreator: null,
            postTest: null,
            markEditor: null,
            minutesRemainingUponResumingTest: null,
            testDueDate: null,
            questionManager: [null, null, []],

            snackbar: {
                hideDuration: 5000,
                isOpen: true,
                message: 'AVO AI Assistant Online',
                variant: 'success',
            },
            classToJumpTo: null,
            setToJumpTo: null,
        };
    }

    color = () => colorList[this.props.color];

    render() {
        const {classes, theme} = this.props;
        const color = this.color();
        const open = this.state.open;
        return (
            <MuiThemeProvider theme={createMuiTheme({palette: {primary: color, type: theme}})}>
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        backgroundColor: theme === 'dark' ? '#303030' : '#fff',
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
                        onClick={(section: Section) =>
                            this.setState({section, classToJumpTo: null, setToJumpTo: null})
                        }
                    />
                    <AvoAppBar
                        section={this.state.section}
                        name={`${this.props.firstName} ${this.props.lastName}`}
                        open={this.state.open}
                        toggleDrawer={() => this.setState({open: !open})}
                        showSnackBar={this.showSnackBar}
                        test={this.state.test}
                    />
                    <div
                        className={classNames(classes.content, {
                            [classes.contentShift]: open,
                        })}
                    >
                        {this.getContent()}
                    </div>
                    <AvoSnackBar {...this.state.snackbar} onClose={this.closeSnackbar} />
                </div>
            </MuiThemeProvider>
        );
    }

    closeSnackbar = () => this.setState({snackbar: {...this.state.snackbar, open: false}});

    jumpToSet(c: number, s: number) {
        this.setState({
            classToJumpTo: c,
            setToJumpTo: s,
            section: 'My Classes',
        });
    }
    jumpToClass(c: number) {
        this.setState({
            classToJumpTo: c,
            setToJumpTo: null,
            section: 'My Classes',
        });
    }
    // ============================== Methods that return parts of what is rendered ==========================

    getContent() {
        // this helper returns the logic for what is loaded in the right side of the menu
        const {isTeacher, color, theme} = this.props;
        const {section} = this.state;
        if (section === 'Home')
            return (
                <HomePage
                    jumpToClass={this.jumpToClass.bind(this)}
                    jumpToSet={this.jumpToSet.bind(this)}
                    color={this.color()}
                    showSnackBar={this.showSnackBar}
                />
            );
        if (section === 'Export Tools')
            return <ExportTools theme={{theme: this.props.theme, color: this.color()}} />;
        if (section === 'My Classes')
            return (
                <MyClasses
                    classToJumpTo={this.state.classToJumpTo}
                    setToJumpTo={this.state.setToJumpTo}
                    showSnackBar={this.showSnackBar}
                    isTeacher={isTeacher}
                    startTest={(cls: {id: number}) => this.startTest(cls)}
                    theme={{theme: this.props.theme, color: this.color()}}
                    postTest={(takes: number) => {
                        this.setState({postTest: takes, section: 'Post Test'});
                    }}
                />
            );
        if (section === 'Manage Classes')
            return (
                <ManageClasses
                    showSnackBar={this.showSnackBar}
                    isTeacher={isTeacher}
                    createTest={(cls: number) => this.startCreateTest(cls)}
                    theme={{theme: this.props.theme, color: this.color()}}
                    postTest={(takes: number) => {
                        this.setState({postTest: takes, section: 'Post Test'});
                    }}
                    markEditor={(takes: number) => {
                        this.setState({markEditor: takes, section: 'Mark Editor'});
                    }}
                />
            );
        if (section === 'Create Test')
            return (
                <CreateTest
                    showSnackBar={this.showSnackBar}
                    isTeacher={isTeacher}
                    classID={this.state.testCreator}
                    onCreate={() => this.setState({section: 'Manage Classes'})}
                />
            );
        if (section === 'My Questions')
            return (
                <QuestionManager
                    showSnackBar={this.showSnackBar}
                    theme={createMuiTheme({palette: {primary: this.color(), type: theme}})}
                    initBuilder={questionBuilder =>
                        this.setState({section: 'Build Question', questionBuilder})
                    }
                    initWith={this.state.questionManager}
                />
            );
        if (section === 'Build Question')
            return (
                <QuestionBuilder
                    showSnackBar={this.showSnackBar}
                    theme={createMuiTheme({palette: {primary: this.color(), type: theme}})}
                    initManager={questionManager =>
                        this.setState({section: 'My Questions', questionManager})
                    }
                    initWith={this.state.questionBuilder}
                />
            );
        if (section === 'Documentation')
            return (
                <QuestionBuilderDocs
                    theme={createMuiTheme({palette: {primary: this.color(), type: theme}})}
                />
            );
        if (section === 'Take Test')
            return (
                <TakeTest
                    showSnackBar={this.showSnackBar}
                    isTeacher={isTeacher}
                    getTimeRemaining={(minutes: number, dueDate: number) =>
                        this.getTimeRemaining(minutes, dueDate)
                    }
                    test={this.state.test}
                    submitTest={(takes: number) =>
                        this.setState({postTest: takes, section: 'Post Test'})
                    }
                />
            );
        if (section === 'Preferences')
            return (
                <Preferences
                    showSnackBar={this.showSnackBar}
                    isTeacher={isTeacher}
                    colorList={colorList}
                    color={color}
                    theme={theme}
                    setColor={this.props.setColor}
                    setTheme={this.props.setTheme}
                />
            );
        if (section === 'Post Test')
            return (
                <PostTest
                    showSnackBar={this.showSnackBar}
                    isTeacher={this.props.isTeacher}
                    takes={this.state.postTest}
                />
            );
        if (section === 'Mark Editor')
            return (
                <MarkEditor
                    showSnackBar={this.showSnackBar}
                    isTeacher={this.props.isTeacher}
                    takes={this.state.markEditor}
                />
            );
        if (section === 'In Class Tools') return <AVOInClassTools />;
        if (section === 'Explanations') return <AVOExplanations />;
        if (section === 'Tag Builder') return <TagView />;
        if (section === 'Notify Class') return <NotifyClass />;
    }

    // ============================== Methods that perform some type of data manipulation =======================

    startCreateTest(cls: number) {
        this.setState({section: 'Create Test', testCreator: cls});
    }

    startTest(test: {id: number}) {
        console.log(test);
        Http.getTest(
            test.id,
            result => {
                this.setState({
                    section: 'Take Test',
                    test: {...result, newAnswers: result.answers},
                });
            },
            result => alert(result.error),
        );
    }

    getTimeRemaining(minutesRemainingUponResumingTest: number, testDueDate: number) {
        // When we hit the getTest route we need to know the time remaining we also have test due date in case
        // it's an assignment because we would want to display that instead
        this.setState({
            minutesRemainingUponResumingTest: minutesRemainingUponResumingTest,
            testDueDate: testDueDate,
        });
    }

    showSnackBar = (variant: SnackbarVariant, message: string, hideDuration: number) => {
        /**
         * @param variant can be success, warning, error, info
         * @param message is the message to display
         * @param hideDuration is optional but it's the ms for the snackbar to show
         **/
        this.setState({
            snackbar: {
                variant,
                message,
                hideDuration:
                    hideDuration === undefined ? this.state.snackbar.hideDuration : hideDuration,
                isOpen: true,
            },
        });
    };
}

export default withStyles(styles)(Layout);
