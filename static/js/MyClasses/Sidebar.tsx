import React, {Component, Fragment} from 'react';
import {
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Paper,
} from '@material-ui/core';
import {
    AddBoxOutlined,
    AssessmentOutlined,
    ExpandLess,
    ExpandMore,
    PeopleOutlined,
} from '@material-ui/icons';
import {GetSections_Section, GetSections_Test, default as Http, collectData} from '../Http';

interface SidebarProps {
    sections: GetSections_Section[];
    now: number;
    clickSection: (sectionID: number) => () => void;
    clickTest: (sectionID: number, testID: number) => () => void;
    enroll: () => void;
}

interface SidebarState {
    open: { [sectionID: number]: boolean };
}

export class Sidebar extends Component<SidebarProps, SidebarState> {
    constructor(props: SidebarProps) {
        super(props);
        const open = {} as { [sectionID: number]: boolean };
        this.props.sections.forEach(s => {
            open[s.sectionID] = true;
        });
        this.state = {
            open,
        };
    }

    componentDidUpdate(prevProps: SidebarProps, prevState: SidebarState) {
        if (prevProps.sections !== this.props.sections) {
            const open = {} as { [sectionID: number]: boolean };
            this.props.sections.forEach(s => {
                open[s.sectionID] = true;
            });
            this.setState({open});
        }
    }

    render() {
        // This is the side menu where students can select the class that they are in
        return (
            <Paper
                classes={{root: 'avo-sidebar'}}
                square
                style={{width: '100%', flex: 1, display: 'flex'}}
            >
                <List style={{flex: 1, overflowY: 'auto', paddingTop: 0}}>
                    <ListSubheader style={{position: 'relative'}}>Sections</ListSubheader>
                    {this.props.sections.map(s => (
                        <Fragment key={`MyClasses-${s.sectionID}`}>
                            <ListItem button onClick={this.props.clickSection(s.sectionID)}>
                                <ListItemIcon>
                                    <PeopleOutlined color='action'/>
                                </ListItemIcon>
                                <ListItemText primary={s.name}/>
                                <IconButton
                                    disabled={s.tests.length === 0}
                                    onClick={this.toggleOpen(s.sectionID)}
                                    style={{padding: '4px'}}
                                >
                                    {this.state.open[s.sectionID] ? (
                                        <ExpandLess
                                            color={s.tests.length === 0 ? 'disabled' : 'action'}
                                        />
                                    ) : (
                                        <ExpandMore
                                            color={s.tests.length === 0 ? 'disabled' : 'action'}
                                        />
                                    )}
                                </IconButton>
                            </ListItem>
                            <Collapse
                                in={this.state.open[s.sectionID]}
                                timeout='auto'
                                unmountOnExit
                            >
                                <List>
                                    {s.tests.map(t => (
                                        <ListItem
                                            key={`MyClasses-${s.sectionID}-${t.testID}`}
                                            button
                                            onClick={this.props.clickTest(s.sectionID, t.testID)}
                                        >
                                            <ListItemIcon>
                                                <AssessmentOutlined
                                                    color={
                                                        isOpen(t, this.props.now)
                                                            ? 'primary'
                                                            : 'disabled'
                                                    }
                                                    style={{marginLeft: '10px'}}
                                                />
                                            </ListItemIcon>
                                            <ListItemText primary={t.name}/>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </Fragment>
                    ))}
                    <ListItem button onClick={this.props.enroll}>
                        <ListItemIcon>
                            <AddBoxOutlined color='action'/>
                        </ListItemIcon>
                        <ListItemText primary='Enroll in Section'/>
                    </ListItem>
                </List>
            </Paper>
        );
    }

    toggleOpen = (sectionID: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        collectData(
            'expand section my classes',
            {section: this.props.sections.find(s => s.sectionID === sectionID)},
            () => {
            },
            console.warn
        );
        this.setState({
            open: {
                ...this.state.open,
                [sectionID]: !this.state.open[sectionID],
            },
        });
    };
}

function isOpen(test: GetSections_Test, now: number) {
    return (
        (test.openTime === null || test.openTime < now) &&
        now < test.deadline &&
        (test.submitted.length < test.attempts || test.attempts === -1)
    );
}
