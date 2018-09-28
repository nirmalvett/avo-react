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
    deepOrange, brown, grey, blueGrey} from '@material-ui/core/colors/';
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
import Home from '@material-ui/icons/Home';
import Menu from '@material-ui/icons/Menu';
import Build from '@material-ui/icons/Build';
import Class from '@material-ui/icons/Class';
import Settings from '@material-ui/icons/Settings';
import ExitToApp from '@material-ui/icons/ExitToApp';

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
        let avoGreen = {'200': '#f8ee7b', '500': '#399103'};
        this.colorList = [red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal,
            avoGreen, green, lightGreen, amber, orange, deepOrange, brown, grey, blueGrey];
        Http.getUserInfo(
            result => {
                // noinspection RedundantConditionalExpressionJS, JSUnresolvedVariable
                this.setState({
                    name: result.first_name + ' ' + result.last_name,
                    color: this.colorList[result.color],
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
            color: this.colorList[9],
            theme: 'dark',
            testCreator: null,
            postTest: null,
        };
    }

    render() {
        const {classes} = this.props;
        const {color, theme, open, isTeacher} = this.state;

        let disabledListItem = (icon, text) => (
            <ListItem button disabled>
                {React.createElement(icon, {color: 'action'})}
                <ListItemText primary={text}/>
            </ListItem>
        );

        return (
            <MuiThemeProvider theme={createMuiTheme({palette: {primary: color, type: theme}})}>
                <div style={{display: 'flex', width: '100%', height: '100%',
                    backgroundColor: theme === 'dark' ? '#303030' : '#fafafa'}}>
                    <Drawer variant='persistent' anchor='left' open={open} classes={{paper: classes.drawerPaper}}>
                        <Logo theme={theme} color={color} style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}/>
                        <Divider/>
                        <div style={{overflowY: 'auto'}}>
                            <List subheader={isTeacher ? <ListSubheader>Student & Teacher</ListSubheader> : undefined}>
                                {this.listItem(Home, 'Home')}
                                {this.listItem(Class, 'My Classes')}
                            </List>
                            {isTeacher ? [
                                <Divider/>,
                                <List subheader={<ListSubheader>Teacher Only</ListSubheader>}>
                                    {this.listItem(Class, 'Manage Classes')}
                                    {disabledListItem(Build, 'Build Question')}
                                </List>
                            ] : undefined}
                            <Divider/>
                            <List>
                                {this.listItem(Settings, 'Preferences')}
                                <ListItem button onClick={() => this.logout()}>
                                    <ExitToApp color='action'/>
                                    <ListItemText primary='Logout'/>
                                </ListItem>
                            </List>
                        </div>
                    </Drawer>
                    <AppBar className={classNames(classes.appBar, {[classes.appBarShift]: open})}>
                        <Toolbar disableGutters>
                            <IconButton style={{marginLeft: 12, marginRight: 20}}
                                        onClick={() => this.setState({open: !open})}>
                                <Menu/>
                            </IconButton>
                            <Typography variant='title' noWrap>{this.state.name}</Typography>
                        </Toolbar>
                    </AppBar>
                    <div className={classNames(classes.content, {[classes.contentShift]: open})}>
                        {this.getContent()}
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }

    listItem(icon, text) {
        let {color, theme} = this.state;
        let selected = this.state.section === text;
        let style = {backgroundColor: selected ? color[theme === 'light' ? '100' : '500'] : undefined};
        return (
            <ListItem button selected={selected} onClick={() => this.setState({section: text})} style={style}>
                {React.createElement(icon, {color: selected && theme === 'light' ? 'primary' : 'action'})}
                <ListItemText primary={text}/>
            </ListItem>
        );
    }

    getContent() {
        const {section, color, theme} = this.state;
        if (section === 'Home')
            return (<HomePage/>);
        if (section === 'My Classes')
            return (<MyClasses startTest={cls => this.startTest(cls)}
                               postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}/>);
        if (section === 'Manage Classes')
            return (<ManageClasses createTest={cls => this.startCreateTest(cls)}
                                   postTest={takes => {this.setState({postTest: takes, section: 'Post Test'})}}/>);
        if (section === 'Create Test')
            return (<CreateTest classID={this.state.testCreator}
                                onCreate={() => this.setState({section: 'Manage Classes'})}/>);
        if (section === 'Build Question')
            return null;
        if (section === 'Take Test')
            return (<TakeTest testID={this.state.test}/>);
        if (section === 'Preferences')
            return (<Preferences colorList={this.colorList}
                                 color={color} changeColor={color => this.setState({color: color})}
                                 theme={theme} changeTheme={theme => this.setState({theme: theme})}/>);
        if (section === 'Post Test')
            return <PostTest takes={this.state.postTest}/>
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
}

export default withStyles(styles)(Layout);