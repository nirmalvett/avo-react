import React, {Fragment} from 'react';
import {Button, TextField, Typography} from '@material-ui/core';

interface EnrollTabProps {
    code: string;
    onChange: (code: string) => void;
    submitCode: () => void;
    errorMessage: string;
    onClose: () => void;
}

export function EnrollTab(props: EnrollTabProps) {
    return (
        <Fragment>
            <Typography component='span' variant='body1' color='textPrimary'>
                Please enter the Enroll code for the Section you want to enroll in.
            </Typography>
            <TextField
                id='avo-myclasses__enroll-textfield'
                margin='normal'
                style={{width: '60%'}}
                label='Enroll code'
                helperText={props.errorMessage}
                error={props.errorMessage !== ''}
                value={props.code}
                onChange={e => props.onChange(e.target.value)}
            />
            <br />
            <Button color='primary' onClick={props.submitCode}>
                Enroll
            </Button>
            <Button color='primary' onClick={props.onClose}>
                Close
            </Button>
        </Fragment>
    );
}
