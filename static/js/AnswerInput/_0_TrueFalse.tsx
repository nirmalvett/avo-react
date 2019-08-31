import React, {Fragment, PureComponent} from 'react';
import {getMathJax} from '../HelperFunctions/Utilities';
import {FormControlLabel, Radio} from '@material-ui/core';
import {AnswerInputImplementationProps} from './AnswerInput';

export class _0_TrueFalse extends PureComponent<AnswerInputImplementationProps> {
    render() {
        const {value, prompt, disabled} = this.props;
        return (
            <Fragment>
                {getMathJax(prompt)}
                <FormControlLabel
                    disabled={disabled}
                    value='true'
                    control={<Radio color='primary' checked={value === 'true'} />}
                    onChange={this.clickTrue}
                    label='True'
                />
                <FormControlLabel
                    disabled={disabled}
                    value='false'
                    control={<Radio color='primary' checked={value === 'false'} />}
                    onChange={this.clickFalse}
                    label='False'
                />
            </Fragment>
        );
    }

    clickTrue = () => {
        this.props.save('true');
        this.props.showSnackBar('info', 'Answer updated', 1000);
    };

    clickFalse = () => {
        this.props.save('false');
        this.props.showSnackBar('info', 'Answer updated', 1000);
    };
}
