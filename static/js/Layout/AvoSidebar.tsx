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
    BugReportOutlined,
    HomeOutlined,
    BuildOutlined,
    HelpOutline,
    ClassOutlined,
    SettingsOutlined,
    ExitToAppOutlined,
    AssignmentReturnedOutlined,
    SvgIconComponent,
    SchoolOutlined,
    MessageOutlined,
    AssignmentTurnedInOutlined,
    ExtensionOutlined,
    OpenInBrowserOutlined,
    Image
} from '@material-ui/icons';
import {Section} from './LayoutModels';
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
                {this.studentSections()}
                {isTeacher && this.teacherSections()}
                {showTestFeatures && this.testFeatures()}
                <Divider />
                <List>
                    {this.listItem(SettingsOutlined, {name: 'My Account'})}
                    {this.listItem(BugReportOutlined, {name: 'Feedback'})}
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

    studentSections() {
        const {isTeacher} = this.props;
        return (
            <List subheader={isTeacher ? <ListSubheader>Student Tools</ListSubheader> : undefined}>
                {this.listItem(HomeOutlined, {name: 'Home'})}
                {this.listItem(OpenInBrowserOutlined, {name: 'Open Courses'})}
                {this.listItem(ClassOutlined, {name: 'My Classes', _class: null, _quiz: null})}
                {this.listItem(SchoolOutlined, {name: 'Learn'})}
                {this.listItem(AssignmentTurnedInOutlined, {name: 'My Assignments'})}
                {this.listItem(Image, {name: 'Upload Images'})}
                {this.props.isAdmin && this.listItem(SchoolOutlined, {name: 'Mastery'})}
            </List>
        );
    }

    teacherSections() {
        return (
            <Fragment>
                <Divider />
                <List subheader={<ListSubheader>Teacher Tools</ListSubheader>}>
                    {this.listItem(ClassOutlined, {name: 'Manage Classes'})}
                    {this.listItem(AssignmentTurnedInOutlined, {name: 'Manage Assignments'})}
                    {this.listItem(AssignmentTurnedInOutlined, {name: 'Add Students'})}
                    {this.listItem(HelpOutline, {name: 'Answer Inquiries'})}
                    {this.listItem(MessageOutlined, {name: 'Notify Class'})}
                    {this.listItem(BuildOutlined, {name: 'My Questions'})}
                    {this.listItem(HelpOutline, {name: 'Documentation'})}
                    {this.listItem(ExtensionOutlined, {name: 'Concept Builder'})}
                    {this.listItem(AssignmentReturnedOutlined, {name: 'Export Tools'})}
                </List>
            </Fragment>
        );
    }

    testFeatures() {
        return (
            <Fragment>
                <Divider />
                <List subheader={<ListSubheader>Experimental Features</ListSubheader>}>
                    {this.listItem(BuildOutlined, {name: 'In Class Tools'})}
                    {this.listItem(BuildOutlined, {name: 'Explanations'})}
                </List>
            </Fragment>
        );
    }

    listItem(Icon: SvgIconComponent, section: Section) {
        return (
            <SidebarListItem
                section={this.props.section}
                onClick={() => this.props.onClick(section)}
                Icon={Icon}
                color={this.props.color}
                theme={this.props.theme}
                text={section.name}
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
    const selected = section.name === text;
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
