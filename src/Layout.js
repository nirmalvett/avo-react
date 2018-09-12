import React from 'react';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import {red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber,
    orange, deepOrange, brown, grey, blueGrey} from '@material-ui/core/colors/';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ListItem from '@material-ui/core/ListItem/ListItem';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';

import HomeIcon from '@material-ui/icons/Home';
import ClassIcon from '@material-ui/icons/Class';
import SchoolIcon from '@material-ui/icons/School';
import BuildIcon from '@material-ui/icons/Build';
import PieChartIcon from '@material-ui/icons/PieChart';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import logoLight from './Avocado_logo_light.svg';
import logoDark from './Avocado_logo_dark.svg';
import Paper from '@material-ui/core/Paper/Paper';
import Preferences from './Preferences';
import Home from './Home';
import LogoutDialogue from './LogoutDialogue'
import MyClasses from './MyClasses'

const drawerWidth = 240;

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

class Layout extends React.Component {
    constructor(props) {
        super(props);
        let color = {red: red, pink: pink, purple: purple, deepPurple: deepPurple, indigo: indigo, blue: blue,
                lightBlue: lightBlue, cyan: cyan, teal: teal, green: green, lightGreen: lightGreen, lime: lime,
                yellow: yellow, amber: amber, orange: orange, deepOrange: deepOrange, brown: brown, grey: grey,
                blueGrey: blueGrey}['green'];
        this.state = {
            name: 'John Doe',
            open: true,
            path: this.props.path,
            color: color,
            theme: 'dark',
            logoutDialogue: false,
        };
    }

    render() {
        let path = this.state.path.slice(1);
        const {classes} = this.props;
        const {open} = this.state;
        const theme = createMuiTheme({palette: {primary: this.state.color, type: this.state.theme}});

        let listItem = (icon, text) => {
            let url = text.replace(/ /, '');
            let selected = this.state.path[0] === url;
            let style = {backgroundColor: selected ? this.state.color[this.state.theme === 'light' ? '100' : '500'] : undefined};
            icon = React.createElement(icon, {color: selected && this.state.theme === 'light' ? 'primary' : 'action'});
            return <ListItem button selected={selected} onClick={() => {this.setState({path: [url]});window.history.pushState({}, null, url)}} style={style}>
                {icon}<ListItemText primary={text}/></ListItem>;
        };

        return (
            <MuiThemeProvider theme={theme}>
                <Paper square style={{display: 'flex', width: '100%', height: '100%'}}>
                    <Drawer variant='persistent' anchor='left' open={open} classes={{paper: classes.drawerPaper}}>
                        <img src={this.state.theme === 'light' ? logoLight : logoDark} alt='' style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}/>
                        <Divider/>
                        <div style={{overflowY: 'auto'}}>
                            <List>
                                {listItem(HomeIcon, 'Home')}
                                {listItem(ClassIcon, 'My Classes')}
                                {listItem(SchoolIcon, 'Teaching Tools')}
                                {listItem(BuildIcon, 'Build Question')}
                                {listItem(PieChartIcon, 'My Analytics')}
                            </List>
                            <Divider/>
                            <List>
                                {listItem(AccountCircleIcon, 'My Account')}
                                {listItem(SettingsIcon, 'Preferences')}
                                <ListItem button onClick={() => this.setState({logoutDialogue: true})}>
                                    <ExitToAppIcon color='action'/>
                                    <ListItemText primary='Logout'/>
                                </ListItem>
                            </List>
                        </div>
                    </Drawer>
                    <AppBar className={classNames(classes.appBar, {[classes.appBarShift]: open})}>
                        <Toolbar disableGutters>
                            <IconButton color='inherit' aria-label='Toggle drawer' style={{marginLeft: 12, marginRight: 20}}
                                        onClick={() => this.setState({open: !this.state.open})}>
                                <MenuIcon/>
                            </IconButton>
                            <Typography variant='title' color='inherit' noWrap>
                                {this.state.name}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <div className={classNames(classes.content, {[classes.contentShift]: open})}>
                        {
                            this.state.path[0] === 'Home' ? <Home/>
                                : this.state.path[0] === 'MyClasses' ? <MyClasses path={path}/>
                                : this.state.path[0] === 'TeachingTools' ? null
                                : this.state.path[0] === 'BuildQuestion' ? null
                                : this.state.path[0] === 'MyAnalytics' ? null
                                : this.state.path[0] === 'MyAccount' ? null
                                : this.state.path[0] === 'Preferences' ? <Preferences theme={this.state.theme}
                                                            changeColor={(color) => this.setState({color: color})}
                                                            changeTheme={(theme) => this.setState({theme: theme})}/>
                                : window.location.href = 'Home'
                        }
                    </div>
                </Paper>
                {this.state.logoutDialogue ?
                    <LogoutDialogue cancel={() => this.setState({logoutDialogue: false})} logout={this.logout}/> : null}
            </MuiThemeProvider>
        );
    }

    // noinspection JSMethodCanBeStatic
    logout() {
        window.location.href = '../SignIn'; // Todo
    }
}


export default withStyles(styles)(Layout);