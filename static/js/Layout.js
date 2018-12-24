import React, { Component, Fragment, createElement } from 'react';
import Http from './Http';
import Logo from './Logo';
import HomePage from './HomePage';
import PostTest from './PostTest';
import TakeTest from './TakeTest';
import classNames from 'classnames';
import MyClasses from './MyClasses';
import TimerComp from "./TimerComp";
import CreateTest from './CreateTest';
import Preferences from './Preferences';
import ManageClasses from './ManageClasses';
import { avoGreen } from "./AVOCustomColors";
import QuestionBuilder from "./QuestionBuilder";
import QuestionBuilderDocs from "./QuestionBuilderDocs";
import { MySnackbarContentWrapper } from "./AVOSnackBar";
import AVOInClassTools from "./AVOInClassTools/AVOInClassTools";
import AVOExplanations from "./AVOExplanations/AVOExplanations";
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';

import {withStyles, List, AppBar, Drawer, Divider, Toolbar, IconButton,
    Typography, ListItem, ListItemText, ListSubheader, Snackbar } from '@material-ui/core';

import {HelpOutline, HomeOutlined, BuildOutlined,
    ClassOutlined, SettingsOutlined, ExitToAppOutlined, Menu } from "@material-ui/icons";

import {red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, amber, orange,
    deepOrange, brown, grey, blueGrey} from '@material-ui/core/colors';


const drawerWidth = 240;
const colorList = [red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, avoGreen, green, lightGreen,
    amber, orange, deepOrange, brown, grey, blueGrey]; // list of colors to choose from
const styles = theme => ({
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeIn,
            duration: theme.transitions.duration.leavingScreen,
        }),
        display: 'flex',
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: drawerWidth,
    },
    content: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeIn,
            duration: theme.transitions.duration.leavingScreen,
        }),
        display: 'flex',
        flex: 1,
        marginTop: '64px',
        marginLeft: -drawerWidth
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0
    },
});

const showTestFeatures = false;
class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.firstName + ' ' + this.props.lastName,
            isTeacher: this.props.isTeacher,
            isAdmin: this.props.isAdmin,
            color: colorList[this.props.color],
            theme: this.props.theme,

            section: 'Home',
            open: true,
            testCreator: null,
            postTest: null,
            minutesRemainingUponResumingTest: null,
            testDueDate: null,

            snackBar_hideDuration: 5000,
            snackBar_isOpen: true,
            snackBar_message: "AVO AI Assistant Online",
            snackBar_variant: "success"
        };
    }

    render() {
        const {classes} = this.props;
        const {color, theme, open } = this.state;
        return (
            <MuiThemeProvider theme={createMuiTheme({palette: {primary: color, type: theme}})}>
                <div style={{display: 'flex', width: '100%', height: '100%',
                    backgroundColor: theme === 'dark' ? '#303030' : '#fff'}}>
                    {this.drawerMenu()}
                    {this.appBar()}
                    <div className={classNames(classes.content, {[classes.contentShift]: open})}>
                        {this.getContent()}
                    </div>
                    {this.snackBar()}
                </div>
            </MuiThemeProvider>
        );
    }

    // ============================== Methods that return parts of what is rendered ==========================
    listItem(icon, text) {
        // This method helps return a list of items for the menu
        let {color, theme} = this.state;
        let selected = this.state.section === text;
        return (
            <ListItem
                button
                classes={{root: 'avo-menu__item'}}
                selected={selected}
                onClick={() => this.setState({section: text})}
                style={{ backgroundColor: selected ? color.main : undefined }}
            >
                {createElement(icon, {nativeColor:
                        selected && theme === 'light' ? 'white' : theme === 'dark' ? 'white' : 'rgba(0,0,0,0.5)' })}
                <ListItemText primary={<div style={{color: selected ? 'white' : ''}}>{text}</div>} />
            </ListItem>
        );
    }

    snackBar(){
        // This helper method returns the logic for pop ups which are called snackBars
        return (
             <Snackbar
                 anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                 open={this.state.snackBar_isOpen}
                 autoHideDuration={this.state.snackBar_hideDuration}
                 onClose={() => this.setState({snackBar_isOpen: false})}
             >
                 <MySnackbarContentWrapper
                     onClose={() => this.setState({snackBar_isOpen: false})}
                     variant={this.state.snackBar_variant}
                     message={this.state.snackBar_message}
                 />
             </Snackbar>
        )
    }

    drawerMenu(){
        // this method returns the left side menu
        const { classes } = this.props;
        const {color, theme, open, isTeacher } = this.state;
        return (
            <Drawer
                variant='persistent'
                anchor='left'
                open={open}
                classes={{paper: classes.drawerPaper}}
            >
                <div className='avo-drawer__with-logo'>
                    <Logo theme={theme} color={color} style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}/>
                    <Divider/>
                    <div style={{overflowY: 'auto'}}>
                        <List subheader={isTeacher ? <ListSubheader>Student & Teacher</ListSubheader> : undefined}>
                            {this.listItem(HomeOutlined, 'Home')}
                            {this.listItem(ClassOutlined, 'My Classes')}
                        </List>
                        {isTeacher  // if it is the teacher then we will the buttons that is allowed for teachers
                            ? <div>
                                <Divider/>
                                <List subheader={<ListSubheader>Teacher Only</ListSubheader>}>
                                    {this.listItem(ClassOutlined, 'Manage Classes')}
                                    {this.listItem(BuildOutlined, 'Build Question')}
                                    {this.listItem(HelpOutline, 'Documentation')}
                                </List>
                            </div>
                            : null
                        }
                        {showTestFeatures
                            ? <Fragment>
                                <Divider/>
                                <List subheader={<ListSubheader>Experimental Features</ListSubheader>}>
                                    {this.listItem(BuildOutlined, 'In Class Tools')}
                                    {this.listItem(BuildOutlined, 'Explanations')}
                                </List>
                                </Fragment>
                            : null
                        }
                        <Divider/>
                        <List>
                            {this.listItem(SettingsOutlined, 'Preferences')}
                            <ListItem
                                button
                                onClick={() => this.logout()}
                                classes={{root : 'avo-menu__item', selected : 'selected'}}
                            >
                                <ExitToAppOutlined color='action'/>
                                <ListItemText primary='Logout'/>
                            </ListItem>
                        </List>
                    </div>
                </div>
            </Drawer>
        )
    }

    appBar(){
        // this helper returns the top bar and includes the logic for timer
        const {open} = this.state;
        const {classes} = this.props;
        return (
            <AppBar className={classNames(classes.appBar, {[classes.appBarShift]: open})}>
                <Toolbar disableGutters>
                    <IconButton style={{marginLeft: 12, marginRight: 20, color : 'white'}}
                                onClick={() => this.setState({open: !open})}>
                        <Menu/>
                    </IconButton>
                    <Typography variant='title' style={{color: 'white'}} noWrap>{this.state.name}</Typography>
                    {this.timerInTopBar()}
                </Toolbar>
            </AppBar>
        );
    }

    getContent() {
        // this helper returns the logic for what is loaded in the right side of the menu
        let {isTeacher, section, color, theme} = this.state;
        if (section === 'Home')
            return (<HomePage
                showSnackBar = {this.showSnackBar.bind(this)}
                isTeacher = {isTeacher}
            />);
        if (section === 'My Classes')
            return (<MyClasses
                showSnackBar = {this.showSnackBar.bind(this)}
                isTeacher = {isTeacher}
                startTest={cls => this.startTest(cls)}
                theme={{theme: this.state.theme, color: this.state.color}}
                postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}
            />);
        if (section === 'Manage Classes')
            return (<ManageClasses
                showSnackBar = {this.showSnackBar.bind(this)}
                isTeacher = {isTeacher}
                createTest={cls => this.startCreateTest(cls)}
                theme={{theme: this.state.theme, color: this.state.color}}
                postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}
            />);
        if (section === 'Create Test')
            return (<CreateTest
                showSnackBar = {this.showSnackBar.bind(this)}
                isTeacher = {isTeacher}
                classID={this.state.testCreator}
                onCreate={() => this.setState({section: 'Manage Classes'})}
            />);
        if (section === 'Build Question')
            return <QuestionBuilder
                showSnackBar = {this.showSnackBar.bind(this)}
                isTeacher = {isTeacher}
                theme={createMuiTheme({palette: {primary: color, type: theme}})}
            />;
        if (section === 'Documentation')
            return <QuestionBuilderDocs
                theme={createMuiTheme({palette: {primary: color, type: theme}})}
            />;
        if (section === 'Take Test')
            return (<TakeTest
                showSnackBar = {this.showSnackBar.bind(this)}
                isTeacher = {isTeacher}
                getTimeRemaining = {(minutes, dueDate) => this.getTimeRemaining(minutes, dueDate)}
                testID={this.state.test.id}
                submitTest={takes => this.setState({postTest: takes, section: 'Post Test'})}
            />);
        if (section === 'Preferences')
            return (<Preferences
                showSnackBar = {this.showSnackBar.bind(this)}
                isTeacher = {isTeacher}
                colorList={colorList}
                color={color} changeColor={color => this.setState({color: color})}
                theme={theme} changeTheme={theme => this.setState({theme: theme})}
            />);
        if (section === 'Post Test')
            return <PostTest
                showSnackBar = {this.showSnackBar.bind(this)}
                isTeacher = {isTeacher}
                takes={this.state.postTest}
            />;
        if (section === 'In Class Tools')
            return <AVOInClassTools />;
        if (section === 'Explanations')
            return <AVOExplanations />;
    }

    timerInTopBar(){
        // the timer logic is found here
        const {minutesRemainingUponResumingTest, testDueDate, section} = this.state;
        // if the current section is take test and the minutesRemaining value exists
        return (section === 'Take Test' && minutesRemainingUponResumingTest !== null)
            ? <TimerComp
                showSnackBar = {this.showSnackBar.bind(this)}
                time = {minutesRemainingUponResumingTest}
                testDueDate = {testDueDate}
                uponCompletionFunc = {() => document.getElementById('avo-test__submit-button').click()}
            />
            : null;
    }

    // ============================== Methods that perform some type of data manipulation =======================

    logout() {
        Http.logout(() => this.props.logout());
    }

    startCreateTest(cls) {
        this.setState({section: 'Create Test', testCreator: cls});
    }

    startTest(test) {
        this.setState({section: 'Take Test', test: test});
    }

    getTimeRemaining(minutesRemainingUponResumingTest, testDueDate){
        // When we hit the getTest route we need to know the time remaining we also have test due date in case
        // it's an assignment because we would want to display that instead
        this.setState({
            minutesRemainingUponResumingTest: minutesRemainingUponResumingTest,
            testDueDate: testDueDate
        });
    }

    showSnackBar(variant, message, hideDuration) {
        /**
         * @param variant can be success, warning, error, info
         * @param message is the message to display
         * @param hideDuration is optional but it's the ms for the snackbar to show
        **/
        this.setState({
            snackBar_isOpen: true,
            snackBar_hideDuration: hideDuration === undefined ? this.state.snackBar_hideDuration : hideDuration,
            snackBar_variant: variant,
            snackBar_message: message
        });
    }
}

export default withStyles(styles)(Layout);
