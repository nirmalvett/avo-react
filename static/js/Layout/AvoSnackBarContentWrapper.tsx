import React from 'react';
import {SnackbarContent, IconButton, withStyles, Theme} from '@material-ui/core';
import {CheckCircle, Warning, Error, Info, Close} from '@material-ui/icons';
import {green, amber} from '@material-ui/core/colors';
import classNames from 'classnames';
import {SnackbarVariant} from './Layout';

const variantIcon = {
    success: CheckCircle,
    warning: Warning,
    error: Error,
    info: Info,
};

const styles = (theme: Theme) => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: green[600],
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(2),
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

interface MySnackbarContentProps {
    classes: {
        success: string;
        error: string;
        info: string;
        warning: string;
        icon: string;
        iconVariant: string;
        message: string;
    };
    className?: string;
    message: string;
    onClose: () => void;
    variant: SnackbarVariant;
}

function AvoSnackbarContent(props: MySnackbarContentProps) {
    const {classes, className, message, onClose, variant} = props;
    const Icon = variantIcon[variant];
    return (
        <SnackbarContent
            className={classNames(classes[variant], className)}
            aria-describedby='client-snackbar'
            message={
                <span id='client-snackbar' className={classes.message}>
                    <Icon className={classNames(classes.icon, classes.iconVariant)} />
                    {message}
                </span>
            }
            action={
                <IconButton key='close' aria-label='Close' color='inherit' onClick={onClose}>
                    <Close className={classes.icon} />
                </IconButton>
            }
        />
    );
}

export const AvoSnackbarContentWrapper = withStyles(styles)(AvoSnackbarContent);
