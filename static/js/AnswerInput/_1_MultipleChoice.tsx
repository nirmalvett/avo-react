import React, {Fragment, PureComponent} from 'react';
import {FormControlLabel, Radio} from '@material-ui/core';
import {AnswerInputImplementationProps} from './AnswerInput';
import {Content} from '../HelperFunctions/Content';

export class _1_MultipleChoice extends PureComponent<AnswerInputImplementationProps> {
    render() {
        const [prompt, ...answers] = this.props.prompt
            .replace('不都', 'None of the above')
            .replace('都', 'All of the above')
            .split('—');
        const {value, disabled} = this.props;
        return (
            <Fragment>
                <Content>{prompt}</Content>
                {answers.map((answer, index) => (
                    <Fragment key={answer + index}>
                        <FormControlLabel
                            control={<Radio color='primary' checked={value === index.toString()} />}
                            disabled={disabled}
                            onChange={this.onChange(index)}
                            label={<Content>{answer}</Content>}
                        />
                        <br />
                    </Fragment>
                ))}
            </Fragment>
        );
    }

    onChange = (index: number) => () => {
        this.props.save(index.toString());
        // this.props.showSnackBar('info', 'Answer updated', 1000); // Removed for milestone 4 to maintain consitency, see issue #185
    };
}
