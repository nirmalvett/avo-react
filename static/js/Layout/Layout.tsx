import React, {Component} from 'react';
import * as Http from '../Http';
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
import ExportTools from '../ExportTools/ExportTools';
import {colorList} from '../SharedComponents/AVOCustomColors';
import NotifyClass from '../Home/NotifyClass';
import {createStyles, Theme} from '@material-ui/core/styles';
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
    | 'Notify Class'
    | 'Post Test'
    | 'Preferences'
    | 'Tag Builder'
    | 'Take Test';

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
    setColor: (color: number) => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

interface LayoutState {
    section: Section;
    open: boolean;
    testCreator: null | number;
    postTest: null | number;
    markEditor: null | number;
    minutesRemainingUponResumingTest: null | number;
    testDueDate: null | number;
    classToJumpTo: null | number;
    setToJumpTo: null | number;
    snackbar: {
        hideDuration: number;
        isOpen: boolean;
        message: string;
        variant: SnackbarVariant;
    };
    test: (Http.GetTest & {newAnswers: string[][]}) | undefined;
    questionManager: any; // todo
    questionBuilder: any; // todo
}

export type ShowSnackBar = (
    variant: SnackbarVariant,
    message: string,
    hideDuration: number,
) => void;

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
            questionManager: [null, null, []], // todo
            questionBuilder: null, // todo

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
        const open = this.state.open;
        return (
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
        );
    }

    closeSnackbar = () => {
        const {hideDuration, variant, message} = this.state.snackbar;
        this.setState({snackbar: {hideDuration, variant, message, isOpen: false}});
    };

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
                    initBuilder={
                        (questionBuilder: any) =>
                            this.setState({section: 'Build Question', questionBuilder}) // todo
                    }
                    initWith={this.state.questionManager}
                />
            );
        if (section === 'Build Question')
            return (
                <QuestionBuilder
                    showSnackBar={this.showSnackBar}
                    initManager={
                        (questionManager: any) =>
                            this.setState({section: 'My Questions', questionManager}) // todo
                    }
                    initWith={this.state.questionBuilder}
                />
            );
        if (section === 'Documentation') return <QuestionBuilderDocs />;
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
                    color={color}
                    theme={theme}
                    setColor={this.props.setColor}
                    setTheme={this.props.setTheme}
                />
            );
        if (section === 'Post Test') return <PostTest takes={this.state.postTest as number} />;
        if (section === 'Mark Editor')
            return (
                <MarkEditor
                    showSnackBar={this.showSnackBar}
                    isTeacher={this.props.isTeacher}
                    takes={this.state.markEditor}
                />
            );
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
                hideDuration: hideDuration || 5000,
                isOpen: true,
            },
        });
    };
}

export default withStyles(styles)(Layout);
