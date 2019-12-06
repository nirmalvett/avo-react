import React from 'react';
import {TextField} from '@material-ui/core';
import {validateNumber} from '../HelperFunctions/Utilities';
import {AnswerInputImplementationProps} from './AnswerInput';
import {Content} from '../HelperFunctions/Content';

export function _2_Number(props: AnswerInputImplementationProps) {
    const message = validateNumber(props.value);
    const error = !props.disabled && !Array.isArray(message);
    const helperText = !Array.isArray(message) ? message : undefined;
    const renderedInput = Array.isArray(message) && message[0] ? (
        <Content>{`\\(${message[0]}\\)`}</Content>
    ) : (
        undefined
    );
    return (
        <div>
            <Content>{props.prompt}</Content>
            <TextField
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
                onBlur={() => props.save(props.value)}
                error={error}
                label='Enter number'
                disabled={props.disabled}
                helperText={helperText}
            />
            <br />
            <br />
            {renderedInput}
        </div>
    );
}
