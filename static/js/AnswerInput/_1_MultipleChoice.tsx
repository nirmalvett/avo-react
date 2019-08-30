import React, {Fragment} from 'react';
import {getMathJax} from '../HelperFunctions/Utilities';
import {FormControlLabel, Radio} from '@material-ui/core';
import {AnswerInputImplementationProps} from './AnswerInput';

export function _1_MultipleChoice(props: AnswerInputImplementationProps) {
    const [prompt, ...answers] = props.prompt
        .replace('不都', 'None of the above')
        .replace('都', 'All of the above')
        .split('—');
    return (
        <Fragment>
            {getMathJax(prompt)}
            {answers.map((answer, index) => (
                <Fragment key={answer + index}>
                    <FormControlLabel
                        control={
                            <Radio color='primary' checked={props.value === index.toString()} />
                        }
                        disabled={props.disabled}
                        onChange={() => props.save(index.toString())}
                        label={getMathJax(answer)}
                    />
                    <br />
                </Fragment>
            ))}
        </Fragment>
    );
}
