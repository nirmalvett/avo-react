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
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';

import HomeIcon from '@material-ui/icons/Home';
import ClassIcon from '@material-ui/icons/Class';
import SchoolIcon from '@material-ui/icons/School';
import BuildIcon from '@material-ui/icons/Build';
import PieChartIcon from '@material-ui/icons/PieChart';
import InfoIcon from '@material-ui/icons/Info';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import logo from './Avocado_logo_transparent.svg';
import Paper from '@material-ui/core/Paper/Paper';

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
    }
});

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'John Doe',
            open: true,
            section: 'Home',
            themePrimary: green,
            themeType: 'dark',
        };
    }

    render() {
        const {classes} = this.props;
        const {open} = this.state;

        const theme = createMuiTheme({palette: {primary: this.state.themePrimary, type: this.state.themeType}});
        return (
            <MuiThemeProvider theme={theme}>
                <Paper square style={{display: 'flex', width: '100%', height: '100%'}}>
                    <Drawer variant='persistent' anchor='left' open={open} classes={{paper: classes.drawerPaper}}>
                        <img src={logo} style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}/>
                        <Divider/>
                        <div style={{'overflow-y': 'auto'}}>
                            <List>
                                <ListItem button><ListItemIcon><HomeIcon/></ListItemIcon>
                                    <ListItemText primary='Home'/></ListItem>
                                <ListItem button><ListItemIcon><ClassIcon/></ListItemIcon>
                                    <ListItemText primary='My Classes'/></ListItem>
                                <ListItem button><ListItemIcon><SchoolIcon/></ListItemIcon>
                                    <ListItemText primary='Teaching Tools'/></ListItem>
                                <ListItem button><ListItemIcon><BuildIcon/></ListItemIcon>
                                    <ListItemText primary='Build Question'/></ListItem>
                                <ListItem button><ListItemIcon><PieChartIcon/></ListItemIcon>
                                    <ListItemText primary='My Analytics'/></ListItem>
                            </List>
                            <Divider/>
                            <List>
                                <ListItem button><ListItemIcon><AccountCircleIcon/></ListItemIcon>
                                    <ListItemText primary='My Account'/></ListItem>
                                <ListItem button><ListItemIcon><InfoIcon/></ListItemIcon>
                                    <ListItemText primary='About'/></ListItem>
                                <ListItem button><ListItemIcon><SettingsIcon/></ListItemIcon>
                                    <ListItemText primary='Preferences'/></ListItem>
                                <ListItem button><ListItemIcon><ExitToAppIcon/></ListItemIcon>
                                    <ListItemText primary='Logout'/></ListItem>
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
                            this.state.section === 'Home' ? null
                                : this.state.section === 'My Classes' ? null
                                : this.state.section === 'Teaching Tools' ? null
                                : this.state.section === 'Build Question' ? null
                                : this.state.section === 'My Analytics' ? null
                                : this.state.section === 'My Account' ? null
                                : this.state.section === 'About' ? null
                                : this.state.section === 'Preferences' ? null
                                : null
                        }
                    </div>
                </Paper>
            </MuiThemeProvider>
        );
    }
}


export default withStyles(styles)(Layout);