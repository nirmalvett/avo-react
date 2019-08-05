import React, {PureComponent, Fragment} from 'react';
import Http from '../HelperFunctions/Http';
import Logo from '../SharedComponents/Logo';
import {createStyles} from '@material-ui/core/styles';
import {
    withStyles,
    List,
    Drawer,
    Divider,
    ListItem,
    ListItemText,
    ListSubheader,
} from '@material-ui/core';
import {
    HomeOutlined,
    BuildOutlined,
    HelpOutline,
    ClassOutlined,
    SettingsOutlined,
    ExitToAppOutlined,
    AssignmentReturnedOutlined,
    SvgIconComponent,
} from '@material-ui/icons';
import {Section} from './Layout';
const drawerWidth = 240;

const styles = () =>
    createStyles({
        drawerPaper: {
            position: 'relative',
            width: drawerWidth,
        },
    });

interface AvoSidebarClasses {
    drawerPaper: string;
}

interface AvoSidebarProps {
    section: Section;
    open: boolean;
    classes: AvoSidebarClasses;
    isTeacher: boolean;
    isAdmin: boolean;
    color: {'200': string; '500': string};
    theme: 'dark' | 'light';
    logout: () => void;
    onClick: (section: Section) => void;
}

const showTestFeatures = false;
class AvoSidebar extends PureComponent<AvoSidebarProps> {
    render() {
        // this method returns the left side menu
        const {classes, theme, color, open} = this.props;
        return (
            <Drawer
                variant='persistent'
                anchor='left'
                open={open}
                classes={{paper: classes.drawerPaper}}
            >
                <div className='avo-drawer__with-logo'>
                    <Logo
                        theme={theme}
                        color={color}
                        style={{width: '80%', marginLeft: '10%', marginTop: '5%'}}
                    />
                    <Divider />
                    {this.list()}
                </div>
            </Drawer>
        );
    }

    list() {
        const {isTeacher} = this.props;
        return (
            <div style={{overflowY: 'auto'}}>
                <List
                    subheader={isTeacher ? <ListSubheader>Student Tools</ListSubheader> : undefined}
                >
                    {this.listItem(HomeOutlined, 'Home')}
                    {this.listItem(ClassOutlined, 'My Classes')}
                </List>
                {isTeacher ? ( // if it is the teacher then we will the buttons that is allowed for teachers
                    <div>
                        <Divider />
                        <List subheader={<ListSubheader>Teacher Tools</ListSubheader>}>
                            {this.listItem(ClassOutlined, 'Manage Classes')}
                            {this.listItem(BuildOutlined, 'My Questions')}
                            {this.listItem(HelpOutline, 'Documentation')}
                            {this.listItem(BuildOutlined, 'Tag Builder')}
                            {this.listItem(AssignmentReturnedOutlined, 'Export Tools')}
                        </List>
                    </div>
                ) : null}
                {showTestFeatures ? (
                    <Fragment>
                        <Divider />
                        <List subheader={<ListSubheader>Experimental Features</ListSubheader>}>
                            {this.listItem(BuildOutlined, 'In Class Tools')}
                            {this.listItem(BuildOutlined, 'Explanations')}
                        </List>
                    </Fragment>
                ) : null}
                <Divider />
                <List>
                    {this.listItem(SettingsOutlined, 'Preferences')}
                    <ListItem
                        button
                        onClick={() => this.logout()}
                        classes={{root: 'avo-menu__item', selected: 'selected'}}
                    >
                        <ExitToAppOutlined color='action' />
                        <ListItemText primary='Logout' />
                    </ListItem>
                </List>
            </div>
        );
    }

    listItem(Icon: SvgIconComponent, text: Section) {
        // This method helps return a list of items for the menu
        const color = this.props.color;
        const theme = this.props.theme;
        let selected = this.props.section === text;
        return (
            <ListItem
                button
                classes={{root: 'avo-menu__item'}}
                selected={selected}
                onClick={() => this.props.onClick(text)}
                style={{backgroundColor: selected ? color['500'] : undefined}}
            >
                <Icon
                    style={{
                        color:
                            selected && theme === 'light'
                                ? 'white'
                                : theme === 'dark'
                                ? 'white'
                                : 'rgba(0,0,0,0.5)',
                    }}
                />
                <ListItemText
                    primary={<div style={{color: selected ? 'white' : ''}}>{text}</div>}
                />
            </ListItem>
        );
    }

    logout() {
        Http.logout(() => this.props.logout(), () => undefined);
    }
}

export default withStyles(styles)(AvoSidebar);
