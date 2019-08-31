import React, {Fragment, PureComponent} from 'react';
import {getMathJax} from '../HelperFunctions/Utilities';
import {FormControlLabel, Radio} from '@material-ui/core';
import {AnswerInputImplementationProps} from './AnswerInput';

export class _1_MultipleChoice extends PureComponent<AnswerInputImplementationProps> {
    render () {
        const [prompt, ...answers] = this.props.prompt
            .replace('不都', 'None of the above')
            .replace('都', 'All of the above')
            .split('—');
        const {value, disabled} = this.props;
        return (
            <Fragment>
                {getMathJax(prompt)}
                {answers.map((answer, index) => (
                    <Fragment key={answer + index}>
                        <FormControlLabel
                            control={
                                <Radio color='primary' checked={value === index.toString()}/>
                            }
                            disabled={disabled}
                            onChange={this.onChange(index)}
                            label={getMathJax(answer)}
                        />
                        <br/>
                    </Fragment>
                ))}
            </Fragment>
        );
    }

    onChange = (index: number) => () => {
        this.props.save(index.toString());
        this.props.showSnackBar('info', 'Answer updated', 1000);
    };
}
