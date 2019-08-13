import React from 'react';
import {AvoSnackbarContentWrapper} from './AvoSnackBarContentWrapper';
import {Snackbar} from '@material-ui/core';
import {SnackbarVariant} from './Layout';

interface SnackbarProps {
    hideDuration: number;
    isOpen: boolean;
    message: string;
    variant: SnackbarVariant;
    onClose: () => void;
}

export default function AvoSnackBar(props: SnackbarProps) {
    return (
        <Snackbar
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            open={props.isOpen}
            autoHideDuration={props.hideDuration}
            onClose={props.onClose}
        >
            <AvoSnackbarContentWrapper
                onClose={props.onClose}
                variant={props.variant}
                message={props.message}
            />
        </Snackbar>
    );
}
