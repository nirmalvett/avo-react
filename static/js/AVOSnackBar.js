/* SnackBar Messages */
import React from "react";
import { SnackbarContent, IconButton, withStyles } from "@material-ui/core";
import { CheckCircle, Warning, Error, Info, Close } from "@material-ui/icons";
import {green, amber } from "@material-ui/core/colors";
import classNames from "classnames";

const variantIcon = {
    success: CheckCircle,
    warning: Warning,
    error: Error,
    info: Info,
};
const styles1 = theme => ({
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
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

export const MySnackbarContentWrapper = withStyles(styles1)(MySnackbarContent);
export function MySnackbarContent(props) {
    const { classes, className, message, onClose, variant } = props;
    const Icon = variantIcon[variant];
    return (
        <SnackbarContent
            className={classNames(classes[variant], className)}
            aria-describedby="client-snackbar"
            message={
                <span id="client-snackbar" className={classes.message}>
                    <Icon className={classNames(classes.icon, classes.iconVariant)} />
                  { message }
                </span>
            }
            action={
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    className={classes.close}
                    onClick={onClose}
                >
                    <Close className={classes.icon} />
                </IconButton>
            }
        />
    );
}
