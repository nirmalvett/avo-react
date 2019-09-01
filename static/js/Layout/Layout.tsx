import React, {Component} from 'react';
import * as Http from '../Http';
import HomePage from '../Home/HomePage';
// import HomePageOld from '../Home/HomePageOld';
import TagView from '../CourseBuilder/TagBuilder/TagView';
import PostTest from '../SharedComponents/PostTest';
import MarkEditor from '../ManageClasses/MarkEditor';
import TakeTest from '../MyClasses/TakeTest';
import MyClasses from '../MyClasses/MyClasses';
import CreateTest from '../ManageClasses/CreateTest/CreateTest';
import Preferences from '../Preferences/Preferences';
import ManageClasses from '../ManageClasses/ManageClasses';
import QuestionManager, {
    QuestionManagerState,
} from '../CourseBuilder/QuestionBuilder/QuestionManager';
import QuestionBuilder from '../QuestionBuilder/QuestionBuilder';
import QuestionBuilderDocs from '../CourseBuilder/QuestionBuilder/QuestionBuilderDocs';
import ExportTools from '../ExportTools/ExportTools';
import AVOLearnComponent from '../Learn/AVOLearnComponent';
import {colorList} from '../SharedComponents/AVOCustomColors';
import NotifyClass from '../Home/NotifyClass';
import {createStyles, Theme} from '@material-ui/core/styles';
import {withStyles} from '@material-ui/core';
import classNames from 'classnames';
import AvoSideBar from './AvoSidebar';
import AvoAppBar from './AvoAppBar';
import AvoSnackBar from './AvoSnackBar';
import Whitelist from '../Whitelist/Whitelist';
import {Section} from './LayoutModels';
import {AvoSet} from '../Http/types';
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
            section: {name: 'Home'},
            open: true,
            snackbar: {
                hideDuration: 5000,
                isOpen: true,
                message: 'AVO AI Assistant Online',
                variant: 'success',
            },
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
                    onClick={(section: Section) => this.setState({section})}
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
                <AvoSnackBar {...this.state.snackbar} onClose={this.closeSnackbar} />
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
        const {isTeacher, color, theme} = this.props;
        const {section} = this.state;
        if (section.name === 'Add Students To Class') {
            return <Whitelist color={this.color()} />;
        } else if (section.name === 'Build Question') {
            return (
                <QuestionBuilder
                    showSnackBar={this.showSnackBar}
                    initManager={this.myQuestions}
                    initWith={section.questionManagerState}
                />
            );
        } else if (section.name === 'Concept Builder') {
            return <TagView />;
        } else if (section.name === 'Create Test') {
            return (
                <CreateTest
                    showSnackBar={this.showSnackBar}
                    classID={section.classID}
                    onCreate={this.manageClasses}
                />
            );
        } else if (section.name === 'Documentation') {
            return QuestionBuilderDocs;
        } else if (section.name === 'Export Tools') {
            return <ExportTools theme={{theme: this.props.theme, color: this.color()}} />;
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
            return <AVOLearnComponent />;
        } else if (section.name === 'Manage Classes') {
            return (
                <ManageClasses
                    showSnackBar={this.showSnackBar}
                    createTest={this.createTest}
                    theme={{theme: this.props.theme, color: this.color()}}
                    postTest={this.postTest}
                    markEditor={this.markEditor}
                />
            );
        } else if (section.name === 'Mark Editor') {
            return <MarkEditor showSnackBar={this.showSnackBar} takes={section.takesID} />;
        } else if (section.name === 'My Classes') {
            return (
                <MyClasses
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
                <QuestionManager
                    showSnackBar={this.showSnackBar}
                    initBuilder={this.buildQuestion}
                    initWith={section.initWith}
                />
            );
        } else if (section.name === 'Notify Class') {
            return <NotifyClass />;
        } else if (section.name === 'Post Test') {
            return <PostTest takes={section.takesID} />;
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
        }
    }

    // ============================== Methods that perform some type of data manipulation =======================

    navigate(section: Section) {
        this.setState({section});
    }

    buildQuestion = (questionManagerState: QuestionManagerState) =>
        this.navigate({name: 'Build Question', questionManagerState});

    createTest = (classID: number) => this.navigate({name: 'Create Test', classID});

    manageClasses = () => this.navigate({name: 'Manage Classes'});

    markEditor = (takesID: number) => this.navigate({name: 'Mark Editor', takesID});

    jumpToSet = (_class: number, _quiz: number) =>
        this.navigate({name: 'My Classes', _class, _quiz});

    jumpToClass = (_class: number) => this.navigate({name: 'My Classes', _class, _quiz: null});

    myQuestions = (initWith: [number, number, AvoSet[]]) =>
        this.navigate({name: 'My Questions', initWith});

    postTest = (takesID: number) => this.navigate({name: 'Post Test', takesID});

    takeTest = (test: Http.GetClasses_Test) => {
        Http.getTest(
            test.testID,
            test => {
                this.setState({section: {name: 'Take Test', test}});
            },
            result => alert(result.error),
        );
    };

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
