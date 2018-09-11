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
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon/ListItemIcon";

import HomeIcon from '@material-ui/icons/Home';
import ClassIcon from '@material-ui/icons/Class';
import SchoolIcon from '@material-ui/icons/School';
import BuildIcon from '@material-ui/icons/Build';
import PieChartIcon from '@material-ui/icons/PieChart';
import InfoIcon from '@material-ui/icons/Info';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import logo from "./Avocado_logo_transparent.svg";

const drawerWidth = 240;

const styles = theme => ({
    root: {flexGrow: 1},
    appFrame: {
        height: 430,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100%',
    },
    appBar: {
        position: 'absolute',
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    'appBarShift-left': {
        marginLeft: drawerWidth,
    },
    'appBarShift-right': {
        marginRight: drawerWidth,
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 20,
    },
    hide: {display: 'none',},
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    'content-left': {marginLeft: -drawerWidth},
    'content-right': {marginRight: -drawerWidth},
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    'contentShift-left': {marginLeft: 0},
    'contentShift-right': {marginRight: 0},
});

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'John Doe',
            open: true,
            section: 'Home',
            themePrimary: green,
            themeSecondary: green,
            themeType: 'light',
        };
    }

    render() {
        const {classes} = this.props;
        const {open} = this.state;

        return (
            <MuiThemeProvider theme={createMuiTheme(
                {
                    palette: {
                        primary: this.state.themePrimary,
                        secondary: this.state.themeSecondary,
                        type: this.state.themeType
                    }
                })}>
                <div className={classes.root} style={{'height': '100%'}}>
                    <div className={classes.appFrame} style={{'height': '100%'}}>
                        <AppBar className={classNames(classes.appBar, {
                            [classes.appBarShift]: open,
                            [classes['appBarShift-left']]: open
                        })}>
                            <Toolbar disableGutters>
                                <IconButton color="inherit" aria-label="Toggle drawer" className={classes.menuButton}
                                            onClick={() => this.setState({open: !this.state.open})}>
                                    <MenuIcon/>
                                </IconButton>
                                <Typography variant="title" color="inherit" noWrap>
                                    {this.state.name}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <Drawer variant="persistent" anchor='left' open={open} classes={{paper: classes.drawerPaper}}>
                            <div className={classes.drawerHeader}>
                                <img src={logo} style={{'width': '90%', 'margin': '5%'}}/>
                            </div>
                            <Divider/>
                            <List>
                                <ListItem button><ListItemIcon><HomeIcon/></ListItemIcon><ListItemText
                                    primary="Home"/></ListItem>
                                <ListItem button><ListItemIcon><ClassIcon/></ListItemIcon><ListItemText
                                    primary="My Classes"/></ListItem>
                                <ListItem button><ListItemIcon><SchoolIcon/></ListItemIcon><ListItemText
                                    primary="Teaching Tools"/></ListItem>
                                <ListItem button><ListItemIcon><BuildIcon/></ListItemIcon><ListItemText
                                    primary="Build Question"/></ListItem>
                                <ListItem button><ListItemIcon><PieChartIcon/></ListItemIcon><ListItemText
                                    primary="My Analytics"/></ListItem>
                            </List>
                            <Divider/>
                            <List>
                                <ListItem button><ListItemIcon><AccountCircleIcon/></ListItemIcon><ListItemText
                                    primary="My Account"/></ListItem>
                                <ListItem button><ListItemIcon><InfoIcon/></ListItemIcon><ListItemText
                                    primary="About"/></ListItem>
                                <ListItem button><ListItemIcon><SettingsIcon/></ListItemIcon><ListItemText
                                    primary="Preferences"/></ListItem>
                                <ListItem button><ListItemIcon><ExitToAppIcon/></ListItemIcon><ListItemText
                                    primary="Logout"/></ListItem>
                            </List>
                        </Drawer>
                        <main>
                            <div className={classes.drawerHeader}/>
                            <Typography>{'You think water moves fast? You should see ice.'}</Typography>
                        </main>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}


export default withStyles(styles, {withTheme: true})(Layout);