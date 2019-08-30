import React, {Fragment} from 'react';
import {getMathJax} from '../HelperFunctions/Utilities';
import {FormControlLabel, Radio} from '@material-ui/core';
import {AnswerInputImplementationProps} from './AnswerInput';

export function _0_TrueFalse({value, prompt, disabled, save}: AnswerInputImplementationProps) {
    return (
        <Fragment>
            {getMathJax(prompt)}
            <FormControlLabel
                disabled={disabled}
                value='true'
                control={<Radio color='primary' checked={value === 'true'} />}
                onChange={() => save('true')}
                label='True'
            />
            <FormControlLabel
                disabled={disabled}
                value='false'
                control={<Radio color='primary' checked={value === 'false'} />}
                onChange={() => save('false')}
                label='False'
            />
        </Fragment>
    );
}
