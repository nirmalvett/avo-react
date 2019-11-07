import React from 'react';
import {TextField} from '@material-ui/core';
import {AnswerInputImplementationProps} from './AnswerInput';
import {Content} from '../HelperFunctions/Content';

export function _3_Expression(props: AnswerInputImplementationProps) {
    return (
        <div>
            <Content>{props.prompt}</Content>
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
