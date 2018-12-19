import React from 'react';
import Http from './Http';
import Logo from './Logo';
import HomePage from './HomePage';
import PostTest from './PostTest';
import MarkEditor from './MarkEditor';
import TakeTest from './TakeTest';
import MyClasses from './MyClasses';
import CreateTest from './CreateTest';
import Preferences from './Preferences';
import ManageClasses from './ManageClasses';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import {red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, amber, orange,
    deepOrange, brown, grey, blueGrey} from '@material-ui/core/colors';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem/ListItem';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import Menu from '@material-ui/icons/Menu';
import HelpOutline from '@material-ui/icons/HelpOutline';
import BuildOutlinedIcon from '@material-ui/icons/BuildOutlined';
import ClassOutlinedIcon from '@material-ui/icons/ClassOutlined';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import TimerComp from "./TimerComp";
import QuestionBuilder from "./QuestionBuilder";
import QuestionBuilderDocs from "./QuestionBuilderDocs";
import { avoGreen } from "./AVOCustomColors";
import Snackbar from '@material-ui/core/Snackbar';
import { MySnackbarContentWrapper } from "./AVOSnackBar";
import AVOInClassTools from "./AVOInClassTools/AVOInClassTools";
import AVOExplanations from "./AVOExplanations/AVOExplanations";

const drawerWidth = 240;
const colorList = [red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, avoGreen, green, lightGreen,
    amber, orange, deepOrange, brown, grey, blueGrey]; // list of colors to choose from
const styles = theme => ({
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
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
class Layout extends React.Component {
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
                    { this.drawerMenu() }
                    { this.appBar() }
                    <div className={classNames(classes.content, {[classes.contentShift]: open})}>
                        {this.getContent()}
                    </div>
                    { this.snackBar() }
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
                {React.createElement(icon,
                    {nativeColor: selected && theme === 'light' ? 'white' : theme === 'dark' ? 'white' : 'rgba(0,0,0,0.5)' })}
                <ListItemText primary={<div style={{ color : selected ? 'white' : '' }}>{text}</div>} />
            </ListItem>
        );
    }

    disabledListItem(icon, text) {
        // This method helps return a disabled menu button that is unclickable
        return (
            <ListItem button disabled>
                {/* createElement(): Create and return a new React element of the given type. The type argument can be
                either a tag name string (such as 'div' or 'span'), a React component type (a class or a function), or a
                React fragment type. */}
                {React.createElement(icon, {color: 'action'})}
                <ListItemText primary={text}/>
            </ListItem>
        )
    }

    snackBar(){
        // This helper method returns the logic for pop ups which are called snackBars
        return (
             <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
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
        const {color, theme, open, isTeacher, isAdmin } = this.state;
        return (
            <Drawer
                        variant='persistent'
                        anchor='left'
                        open={open}
                        classes={{
                            paper: classes.drawerPaper
                        }}
                    >
                        <div className='avo-drawer__with-logo'>
                            <Logo theme={theme} color={color} style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}/>
                            <Divider/>
                            <div style={{overflowY: 'auto'}}>
                                <List subheader={isTeacher ? <ListSubheader>Student & Teacher</ListSubheader> : undefined}>
                                    {this.listItem(HomeOutlinedIcon, 'Home')}
                                    {this.listItem(ClassOutlinedIcon, 'My Classes')}
                                </List>
                                { // if it is the teacher then we will the buttons that is allowed for teachers
                                isTeacher
                                    ? <div>
                                        <Divider/>
                                            <List subheader={<ListSubheader>Teacher Only</ListSubheader>}>
                                                {this.listItem(ClassOutlinedIcon, 'Manage Classes')}
                                                {this.listItem(BuildOutlinedIcon, 'Build Question')}
                                                {this.listItem(HelpOutline, 'Documentation')}
                                            </List>
                                        </div>
                                    : undefined
                                }
                                {showTestFeatures
                                    ? <React.Fragment>
                                        <Divider/>
                                        <List subheader={<ListSubheader>Experimental Features</ListSubheader>}>
                                            { this.listItem(BuildOutlinedIcon, 'In Class Tools') }
                                            { this.listItem(BuildOutlinedIcon, 'Explanations') }
                                        </List>
                                    </React.Fragment>
                                    : null
                                }
                                <Divider/>
                                <List>
                                    {this.listItem(SettingsOutlinedIcon, 'Preferences')}
                                    <ListItem
                                        button
                                        onClick={() => this.logout()}
                                        classes={{
                                            root : 'avo-menu__item',
                                            selected : 'selected'
                                        }}
                                    >
                                        <ExitToAppOutlinedIcon color='action'/>
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
        const { open } = this.state;
        const { classes } = this.props;
        return (
              <AppBar className={classNames(classes.appBar, {[classes.appBarShift]: open})}>
                        <Toolbar disableGutters>
                            <IconButton style={{marginLeft: 12, marginRight: 20, color : 'white'}}
                                        onClick={() => this.setState({open: !open})}>
                                <Menu/>
                            </IconButton>
                            <Typography variant='title' style={{ color : 'white' }} noWrap>{this.state.name}</Typography>
                          { this.timerInTopBar() }
                        </Toolbar>
                    </AppBar>
        )
    }

    getContent() {
        // this helper returns the logic for what is loaded in the right side of the menu
        const isTeacher = this.state;
        const {section, color, theme} = this.state;
        if (section === 'Home')
            return (<HomePage showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {this.state.isTeacher}/>);
        if (section === 'My Classes')
            return (<MyClasses showSnackBar = {this.showSnackBar.bind(this)}
                               isTeacher = {this.state.isTeacher}
                               startTest={cls => this.startTest(cls)}
                               theme={{ theme : this.state.theme, color : this.state.color }}
                               postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}
                    />);
        if (section === 'Manage Classes')
            return (<ManageClasses showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {this.state.isTeacher}
                                   createTest={cls => this.startCreateTest(cls)}
                                   theme={{ theme : this.state.theme, color : this.state.color }}
                                   postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}
                                    markEditor={takes => {this.setState({markEditor: takes, section: 'Mark Editor'})}}                                   
                                />);
        if (section === 'Create Test')
            return (<CreateTest showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {this.state.isTeacher}
                                classID={this.state.testCreator}
                                onCreate={() => this.setState({section: 'Manage Classes'})}/>);
        if (section === 'Build Question')
            return <QuestionBuilder showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {this.state.isTeacher}
                                    theme={createMuiTheme({palette: {primary: color, type: theme}})}/>;
        if (section === 'Documentation')
            return <QuestionBuilderDocs theme={createMuiTheme({palette: {primary: color, type: theme}})}/>;
        if (section === 'Take Test')
            return (<TakeTest showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {this.state.isTeacher}
                              getTimeRemaining = {(minutes, dueDate) => this.getTimeRemaining(minutes, dueDate)}
                              testID={this.state.test.id}
                              submitTest={takes => this.setState({postTest: takes, section: 'Post Test'})}/>);
        if (section === 'Preferences')
            return (<Preferences showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {this.state.isTeacher}
                                 colorList={colorList}
                                 color={color} changeColor={color => this.setState({color: color})}
                                 theme={theme} changeTheme={theme => this.setState({theme: theme})}/>);
        if (section === 'Post Test')
            return <PostTest showSnackBar = {this.showSnackBar.bind(this)}
                             isTeacher = {this.state.isTeacher}
                             takes={this.state.postTest}/>
        if(section === 'Mark Editor') {
            return (
                <MarkEditor
                    showSnackBar = {this.showSnackBar.bind(this)}
                    isTeacher = {this.state.isTeacher}
                    takes={this.state.markEditor}
                />
            );
        }
        if (section === 'In Class Tools')
            return <AVOInClassTools />
        if (section === 'Explanations')
            return <AVOExplanations />
    }

    timerInTopBar(){
       // the timer logic is found here
      const { minutesRemainingUponResumingTest, section} = this.state;
      return (
          <React.Fragment>
               {
                    section === 'Take Test' &&  // if the current section is take test
                    minutesRemainingUponResumingTest !== null // if the minutesRemaining value exists
                        ? <TimerComp
                            showSnackBar = {this.showSnackBar.bind(this)}
                            time={this.state.minutesRemainingUponResumingTest}
                            testDueDate = {this.state.testDueDate}
                            uponCompletionFunc={() => document.getElementById('avo-test__submit-button').click()} />
                        : null
                }
          </React.Fragment>
      )

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
