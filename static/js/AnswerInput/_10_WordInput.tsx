import React from 'react';
import {TextField, Typography} from '@material-ui/core';
import {AnswerInputImplementationProps} from './AnswerInput';

export function _10_WordInput(props: AnswerInputImplementationProps) {
    return (
        <div>
            <Typography>Please enter your answer separated by ~~</Typography>
            <Typography>{props.prompt}</Typography>
            <TextField
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
                onBlur={() => props.save(props.value)}
                label='Answer here...'
                disabled={props.disabled}
                helperText={'Separate each word with ~~'}
            />
        </div>
    );
}
