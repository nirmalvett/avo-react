import React, {Component, Fragment} from 'react';
import Http from '../HelperFunctions/Http';
import Logo from '../SharedComponents/Logo';
import HomePage from '../Home/HomePage';
import PostTest from '../SharedComponents/PostTest';
import MarkEditor from '../ManageClasses/MarkEditor';
import TakeTest from '../MyClasses/TakeTest';
import MyClasses from '../MyClasses/MyClasses';
import Timer from "../MyClasses/TimerComp";
import CreateTest from '../ManageClasses/CreateTest';
import Preferences from '../Preferences/Preferences';
import Sythesis from '../Sythesis';
import ManageClasses from '../ManageClasses/ManageClasses';
import QuestionManager from "../CourseBuilder/QuestionBuilder/QuestionManager";
import QuestionBuilder from "../QuestionBuilder/QuestionBuilder";
import QuestionBuilderDocs from "../CourseBuilder/QuestionBuilder/QuestionBuilderDocs";
import AVOInClassTools from "../MISC/AVOInClassTools/AVOInClassTools";
import AVOExplanations from "../MISC/AVOExplanations/AVOExplanations";
import { avoGreen } from "../SharedComponents/AVOCustomColors";
import { MySnackbarContentWrapper } from "../SharedComponents/AVOSnackBar";
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import {withStyles, List, AppBar, Drawer, Divider, Toolbar, IconButton,
    Typography, ListItem, ListItemText, ListSubheader, Snackbar } from '@material-ui/core';
import { HomeOutlined, BuildOutlined, HelpOutline,
    ClassOutlined, SettingsOutlined, ExitToAppOutlined, Menu } from "@material-ui/icons";
import {red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, amber, orange,
    deepOrange, brown, grey, blueGrey} from '@material-ui/core/colors';
import classNames from 'classnames';
import {copy} from "../HelperFunctions/Utilities";
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
            markEditor: null,
            minutesRemainingUponResumingTest: null,
            testDueDate: null,
            questionManager: [null, null, []],

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
    listItem(Icon, text) {
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
                <Icon nativeColor={selected && theme === 'light' ? 'white' : theme === 'dark' ? 'white' : 'rgba(0,0,0,0.5)'}/>
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
                        <List subheader={isTeacher ? <ListSubheader>Student Tools</ListSubheader> : undefined}>
                            {this.listItem(HomeOutlined, 'Home')}
                            {this.listItem(ClassOutlined, 'My Classes')}
                        </List>
                        {isTeacher  // if it is the teacher then we will the buttons that is allowed for teachers
                            ? <div>
                                <Divider/>
                                <List subheader={<ListSubheader>Teacher Tools</ListSubheader>}>
                                    {this.listItem(ClassOutlined, 'Manage Classes')}
                                    {this.listItem(BuildOutlined, 'My Questions')}
                                    {this.listItem(HelpOutline, 'Documentation')}
                                    {this.listItem(HelpOutline, 'Sythesis')}
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
        if (section === 'Home') return (<HomePage
            showSnackBar = {this.showSnackBar.bind(this)}
            isTeacher = {isTeacher}
        />);
        if (section === 'My Classes') return (<MyClasses
            showSnackBar = {this.showSnackBar.bind(this)}
            isTeacher = {isTeacher}
            startTest={cls => this.startTest(cls)}
            theme={{theme: this.state.theme, color: this.state.color}}
            postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}
        />);
        if (section === 'Manage Classes') return (<ManageClasses
            showSnackBar = {this.showSnackBar.bind(this)}
            isTeacher = {isTeacher}
            createTest={cls => this.startCreateTest(cls)}
            theme={{theme: this.state.theme, color: this.state.color}}
            postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}
            markEditor={takes => {this.setState({markEditor: takes, section: 'Mark Editor'})}}
        />);
        if (section === 'Create Test') return (<CreateTest
            showSnackBar = {this.showSnackBar.bind(this)}
            isTeacher = {isTeacher}
            classID={this.state.testCreator}
            onCreate={() => this.setState({section: 'Manage Classes'})}
        />);
        if (section === 'My Questions') return (<QuestionManager
            showSnackBar = {this.showSnackBar.bind(this)}
            theme={createMuiTheme({palette: {primary: color, type: theme}})}
            initBuilder={questionBuilder => this.setState({section: 'Build Question', questionBuilder})}
            initWith={this.state.questionManager}
        />);
        if (section === 'Build Question') return (<QuestionBuilder
            showSnackBar = {this.showSnackBar.bind(this)}
            theme={createMuiTheme({palette: {primary: color, type: theme}})}
            initManager={questionManager => this.setState({section: 'My Questions', questionManager})}
            initWith={this.state.questionBuilder}
        />);
        if (section === 'Documentation') return (<QuestionBuilderDocs
            theme={createMuiTheme({palette: {primary: color, type: theme}})}
        />);
        if (section === 'Take Test') return (<TakeTest
            showSnackBar = {this.showSnackBar.bind(this)}
            isTeacher = {isTeacher}
            getTimeRemaining = {(minutes, dueDate) => this.getTimeRemaining(minutes, dueDate)}
            test={this.state.test}
            submitTest={takes => this.setState({postTest: takes, section: 'Post Test'})}
        />);
        if (section === 'Preferences') return (<Preferences
            showSnackBar = {this.showSnackBar.bind(this)}
            isTeacher = {isTeacher}
            colorList={colorList}
            color={color} changeColor={color => this.setState({color: color})}
            theme={theme} changeTheme={theme => this.setState({theme: theme})}
        />);
        if (section === 'Post Test') return (<PostTest
            showSnackBar = {this.showSnackBar.bind(this)}
            isTeacher = {this.state.isTeacher}
            takes={this.state.postTest}
        />);
        if (section === 'Mark Editor') return (<MarkEditor
            showSnackBar = {this.showSnackBar.bind(this)}
            isTeacher = {this.state.isTeacher}
            takes={this.state.markEditor}
        />);
        if (section === 'In Class Tools') return (<AVOInClassTools/>);
        if (section === 'Explanations') return (<AVOExplanations/>);
        if (section === 'Sythesis') return (<Sythesis/>);
        
    }

    timerInTopBar(){
        if (this.state.section === 'Take Test') return (
            <Timer
                showSnackBar={this.showSnackBar.bind(this)}
                deadline={this.state.test.time_submitted}
                onCompletionFunc={() => {
                    setTimeout(
                        () => document.getElementById('avo-test__submit-button').click(),
                        100
                    );
                    // This runs first, but putting it second guarantees that the button will always be clicked
                    document.activeElement.blur();
                }}
            />
        );
        return null;
    }

    // ============================== Methods that perform some type of data manipulation =======================

    logout() {
        Http.logout(() => this.props.logout());
    }

    startCreateTest(cls) {
        this.setState({section: 'Create Test', testCreator: cls});
    }

    startTest(test) {
        console.log(test);
        Http.getTest(test.id, result => {
			result.newAnswers = copy(result.answers);
			this.setState({section: 'Take Test', test: result});
		}, (result) => alert(result.error));
    }

    getTimeRemaining(minutesRemainingUponResumingTest, testDueDate) {
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
