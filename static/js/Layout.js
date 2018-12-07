import React from 'react';
import Http from './Http';
import Logo from './Logo';
import HomePage from './HomePage';
import PostTest from './PostTest';
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
import BuildOutlinedIcon from '@material-ui/icons/BuildOutlined';
import ClassOutlinedIcon from '@material-ui/icons/ClassOutlined';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import { isNotChromeAlert } from "./helpers";
import TimerComp from "./TimerComp";
import QuestionBuilder from "./QuestionBuilder";
import { avoGreen } from "./AVOCustomColors";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning'
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

/* SnackBar Messages */
const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};
const styles1 = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor:  green[600],
  },
  info: {
    backgroundColor:  green[600],
  },
  warning: {
    backgroundColor:  green[600],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});
const MySnackbarContentWrapper = withStyles(styles1)(MySnackbarContent);
function MySnackbarContent(props) {
  const { classes, className, message, onClose, variant } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
            {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
    />
  );
}

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
        const {color, theme, open, isTeacher, isAdmin, minutesRemainingUponResumingTest, section} = this.state;

        let disabledListItem = (icon, text) => (
            <ListItem button disabled>
                {/* createElement(): Create and return a new React element of the given type. The type argument can be
                either a tag name string (such as 'div' or 'span'), a React component type (a class or a function), or a
                React fragment type. */}
                {React.createElement(icon, {color: 'action'})}
                <ListItemText primary={text}/>
            </ListItem>
        );

        return (
            <MuiThemeProvider theme={createMuiTheme({palette: {primary: color, type: theme}})}>
                <div style={{display: 'flex', width: '100%', height: '100%',
                    backgroundColor: theme === 'dark' ? '#303030' : '#fff'}}>
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
                                {
                                isTeacher
                                    ?
                                        <div>
                                            <Divider/>
                                            <List subheader={<ListSubheader>Teacher Only</ListSubheader>}>
                                                {this.listItem(ClassOutlinedIcon, 'Manage Classes')}
                                                {isAdmin
                                                    ? this.listItem(BuildOutlinedIcon, 'Build Question')
                                                    : disabledListItem(BuildOutlinedIcon, 'Build Question')
                                                }
                                            </List>
                                        </div>
                                    : undefined
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
                    <AppBar className={classNames(classes.appBar, {[classes.appBarShift]: open})}>
                        <Toolbar disableGutters>
                            <IconButton style={{marginLeft: 12, marginRight: 20, color : 'white'}}
                                        onClick={() => this.setState({open: !open})}>
                                <Menu/>
                            </IconButton>
                            <Typography variant='title' style={{ color : 'white' }} noWrap>{this.state.name}</Typography>
                            { // this is timer value at the top of the bar
                                section === 'Take Test' &&  // if the current section is take test
                                minutesRemainingUponResumingTest !== null // if the minutesRemaining value exists
                                    ?
                                      <TimerComp
                                          showSnackBar = {this.showSnackBar.bind(this)}
                                          time={this.state.minutesRemainingUponResumingTest}
                                          testDueDate = {this.state.testDueDate}
                                          uponCompletionFunc={() => document.getElementById('avo-test__submit-button').click()} />
                                    : null
                            }
                        </Toolbar>
                    </AppBar>
                    <div className={classNames(classes.content, {[classes.contentShift]: open})}>
                        {this.getContent()}
                    </div>
                </div>
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
            </MuiThemeProvider>
        );
    }

    listItem(icon, text) {
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

    getContent() {
        const isTeacher = this.state;
        const {section, color, theme} = this.state;
        if (section === 'Home')
            return (<HomePage showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {isTeacher}/>);
        if (section === 'My Classes')
            return (<MyClasses
                                showSnackBar = {this.showSnackBar.bind(this)}
                                isTeacher = {isTeacher}
                                startTest={cls => this.startTest(cls)}
                                theme={{ theme : this.state.theme, color : this.state.color }}
                                postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}/>);
        if (section === 'Manage Classes')
            return (<ManageClasses
                                  showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {isTeacher}
                                  createTest={cls => this.startCreateTest(cls)}
                                   theme={{ theme : this.state.theme, color : this.state.color }}
                                   postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}/>);
        if (section === 'Create Test')
            return (<CreateTest
                                showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {isTeacher}
                                classID={this.state.testCreator}
                                onCreate={() => this.setState({section: 'Manage Classes'})}/>);
        if (section === 'Build Question')
            return <QuestionBuilder
                howSnackBar = {this.showSnackBar.bind(this)} isTeacher = {isTeacher}
                theme={createMuiTheme({palette: {primary: color, type: theme}})}/>;
        if (section === 'Take Test')
            return (<TakeTest
                                showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {isTeacher}
                                getTimeRemaining = {(minutes, dueDate) => this.getTimeRemaining(minutes, dueDate)}
                                testID={this.state.test.id}
                                submitTest={takes => this.setState({postTest: takes, section: 'Post Test'})}/>);
        if (section === 'Preferences')
            return (<Preferences
                                showSnackBar = {this.showSnackBar.bind(this)} isTeacher = {isTeacher}
                                colorList={colorList}
                                 color={color} changeColor={color => this.setState({color: color})}
                                 theme={theme} changeTheme={theme => this.setState({theme: theme})}/>);
        if (section === 'Post Test')
            return <PostTest showSnackBar = {this.showSnackBar.bind(this)}
                             isTeacher = {isTeacher}
                             takes={this.state.postTest}/>
    }

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

    showSnackBar(variant, message, hideDuration){
      // variant can be success, warning, error, info
      // message is the message to display
      // hideDuration is optional but it's the ms for the snackbar to show
      this.setState({
        snackBar_isOpen: true,
        snackBar_hideDuration: hideDuration === undefined ? this.state.snackBar_hideDuration : hideDuration,
        snackBar_variant: variant,
        snackBar_message: message
      })
    }

}

export default withStyles(styles)(Layout);