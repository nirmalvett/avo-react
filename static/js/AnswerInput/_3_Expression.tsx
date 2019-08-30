import React from 'react';
import {TextField} from '@material-ui/core';
import {getMathJax} from '../HelperFunctions/Utilities';
import {AnswerInputImplementationProps} from './AnswerInput';

export function _3_Expression(props: AnswerInputImplementationProps) {
    return (
        <div>
            {getMathJax(props.prompt)}
            <TextField
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
                onBlur={() => props.save(props.value)}
                label='Enter expression'
                disabled={props.disabled}
            />
        </div>
    );
}
