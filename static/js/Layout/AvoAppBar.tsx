import React, {PureComponent} from 'react';
import Timer from './TimerComp';
import {createStyles, Theme} from '@material-ui/core/styles';
import {withStyles, AppBar, Toolbar, IconButton, Typography} from '@material-ui/core';
import {Menu} from '@material-ui/icons';
import classNames from 'classnames';
import {Section, ShowSnackBar} from './Layout';
import {GetTest} from '../Http';
const drawerWidth = 240;

const styles = (theme: Theme) =>
    createStyles({
        appBar: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeIn,
                duration: theme.transitions.duration.leavingScreen,
            }),
            display: 'flex',
            backgroundColor: theme.palette.primary.main,
        },
        appBarShift: {
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: drawerWidth,
        },
    });

interface AvoAppBarClasses {
    appBar: string;
    appBarShift: string;
}

interface AvoAppBarProps {
    open: boolean;
    toggleDrawer: () => void;
    classes: AvoAppBarClasses;
    section: Section;
    name: string;
    showSnackBar: ShowSnackBar;
    test: (GetTest & {newAnswers: string[][]}) | undefined;
}

class AvoAppBar extends PureComponent<AvoAppBarProps> {
    // ============================== Methods that return parts of what is rendered ==========================

    render() {
        // this helper returns the top bar and includes the logic for timer
        const {open, classes} = this.props;
        return (
            <AppBar className={classNames(classes.appBar, {[classes.appBarShift]: open})}>
                <Toolbar disableGutters>
                    <IconButton
                        style={{marginLeft: 12, marginRight: 20, color: 'white'}}
                        onClick={this.props.toggleDrawer}
                    >
                        <Menu />
                    </IconButton>
                    <Typography variant='h6' style={{color: 'white'}} noWrap>
                        {this.props.name}
                    </Typography>
                    {this.timerInTopBar()}
                </Toolbar>
            </AppBar>
        );
    }

    timerInTopBar() {
        if (this.props.section !== 'Take Test' || this.props.test === undefined) return null;
        return (
            <Timer
                showSnackBar={this.props.showSnackBar}
                deadline={this.props.test.time_submitted}
                onCompletionFunc={() => {
                    try {
                        // @ts-ignore
                        document.activeElement.blur();
                    } catch (ignored) {}
                    setTimeout(() => {
                        // @ts-ignore
                        document.getElementById('avo-test__submit-button').click();
                    }, 100);
                }}
            />
        );
    }
}

export default withStyles(styles)(AvoAppBar);
