import React from 'react';
import {AnswerInputImplementationProps} from './AnswerInput';
import WordInput from '../QuestionBuilder/WordInput'

export function _10_WordInput_WordMode(props: AnswerInputImplementationProps) {
    return (
        <WordInput
            onChange={value => {
                props.save(value);
                props.onChange(value)
            }}
            color={{200: 'green', 500: 'green'}}
            value={props.value}
            mode={'word'}
            disabled={props.disabled}
        >
            {props.prompt}
        </WordInput>
    );
}
