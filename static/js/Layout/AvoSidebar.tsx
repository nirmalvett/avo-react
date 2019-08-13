import React, {PureComponent, Fragment} from 'react';
import * as Http from '../Http';
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
    ListItemIcon,
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
                    {this.listItem(ClassOutlined, 'Learn')}
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
                    <SidebarListItem
                        section={this.props.section}
                        Icon={ExitToAppOutlined}
                        color={this.props.color}
                        onClick={this.logout}
                        text='Logout'
                        theme={this.props.theme}
                    />
                </List>
            </div>
        );
    }

    listItem(Icon: SvgIconComponent, text: Section) {
        return (
            <SidebarListItem
                section={this.props.section}
                onClick={() => this.props.onClick(text)}
                Icon={Icon}
                color={this.props.color}
                theme={this.props.theme}
                text={text}
            />
        );
    }

    logout = () => Http.logout(() => this.props.logout(), () => undefined);
}

interface SidebarListItemProps {
    section: Section;
    Icon: SvgIconComponent;
    color: {'500': string};
    onClick: () => void;
    text: string;
    theme: 'dark' | 'light';
}

function SidebarListItem({section, Icon, color, theme, onClick, text}: SidebarListItemProps) {
    const selected = section === text;
    const bg = selected || theme === 'dark' ? 'white' : 'rgba(0,0,0,0.5)';
    return (
        <ListItem
            button
            classes={{root: 'avo-menu__item'}}
            selected={selected}
            onClick={onClick}
            style={{backgroundColor: selected ? color['500'] : undefined}}
        >
            <ListItemIcon>
                <Icon style={{color: bg}} />
            </ListItemIcon>
            <ListItemText primary={<div style={{color: selected ? 'white' : ''}}>{text}</div>} />
        </ListItem>
    );
}

export default withStyles(styles)(AvoSidebar);
