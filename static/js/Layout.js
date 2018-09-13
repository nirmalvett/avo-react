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
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn'

import Paper from '@material-ui/core/Paper/Paper';
import Preferences from './Preferences';
import Home from './Home';
import MyClasses from './MyClasses'
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import Logo from "./Logo";
import Http from "./Http";

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
        let color = [red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal,
            green, lightGreen, lime, yellow, amber, orange, deepOrange, brown, grey, blueGrey];
        Http.getUserInfo(
            (result) => {
                this.setState({
                    name: result.first_name + ' ' + result.last_name,
                    color: color[result.color],
                    theme: result.theme ? 'dark' : 'light',
                    isTeacher: result.is_teacher
                });
            },
            () => {this.logout();}
            );
        this.state = {
            section: 'Home',
            isTeacher: false,
            name: 'Loading...',
            open: true,
            color: color[9],
            theme: 'dark',
        };
        this.logout = this.logout.bind(this);
    }

    render() {
        const {classes} = this.props;
        const {open} = this.state;
        const theme = createMuiTheme({palette: {primary: this.state.color, type: this.state.theme}});

        let listItem = (icon, text) => {
            let selected = this.state.section === text;
            let style = {backgroundColor: selected ? this.state.color[this.state.theme === 'light' ? '100' : '500'] : undefined};
            icon = React.createElement(icon, {color: selected && this.state.theme === 'light' ? 'primary' : 'action'});
            return <ListItem button selected={selected} onClick={() => this.setState({section: text})} style={style}>
                {icon}<ListItemText primary={text}/></ListItem>;
        };
        let disabledListItem = (icon, text) =>
            <ListItem button disabled>{React.createElement(icon, {color: 'action'})}<ListItemText primary={text}/></ListItem>;

        return (
            <MuiThemeProvider theme={theme}>
                <Paper square style={{display: 'flex', width: '100%', height: '100%'}}>
                    <Drawer variant='persistent' anchor='left' open={open} classes={{paper: classes.drawerPaper}}>
                        <Logo theme={this.state.theme} style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}/>
                        <Divider/>
                        <div style={{overflowY: 'auto'}}>
                            <List subheader={this.state.isTeacher && <ListSubheader component='div'>Student & Teacher</ListSubheader>}>
                                {listItem(HomeIcon, 'Home')}
                                {listItem(ClassIcon, 'My Classes')}
                                {disabledListItem(AssignmentTurnedInIcon, 'Explanations')}
                            </List>
                            {this.state.isTeacher && [
                                <Divider/>,
                                <List subheader={<ListSubheader component='div'>Teacher Only</ListSubheader>}>
                                    {disabledListItem(SchoolIcon, 'Teaching Tools')}
                                    {disabledListItem(BuildIcon, 'Build Question')}
                                </List>
                            ]}
                            <Divider/><List>
                                {listItem(SettingsIcon, 'Preferences')}
                                <ListItem button onClick={() => this.logout()}>
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
                            this.state.section === 'Home' ? <Home/>
                                : this.state.section === 'My Classes' ? <MyClasses/>
                                : this.state.section === 'Teaching Tools' ? null
                                : this.state.section === 'Explanations' ? null
                                : this.state.section === 'Build Question' ? null
                                : this.state.section === 'Preferences' ? <Preferences theme={this.state.theme}
                                                            changeColor={(color) => this.setState({color: color})}
                                                            changeTheme={(theme) => this.setState({theme: theme})}/>
                                : null
                        }
                    </div>
                </Paper>
            </MuiThemeProvider>
        );
    }

    logout() {
        Http.logout(() => {
            console.log('Logged out');
            this.props.logout();
        });
    }
}


export default withStyles(styles)(Layout);