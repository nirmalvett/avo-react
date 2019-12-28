import React, {PureComponent, ReactElement} from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import {ShowSnackBar} from '../Layout/Layout';
import {_0_TrueFalse} from './_0_TrueFalse';
import {_1_MultipleChoice} from './_1_MultipleChoice';
import {_2_Number} from './_2_Number';
import {_3_Expression} from './_3_Expression';
import {_6_Vector} from './_6_Vector';
import {_8_Matrix} from './_8_Matrix';
import {_9_Basis} from './_9_Basis';
import {_10_WordInput} from './_10_WordInput';

interface AnswerInputProps {
    type: string;
    value: string;
    prompt: string;
    disabled: boolean;
    onChange: (answer: string) => void;
    save: (answer: string) => void;
    showSnackBar: ShowSnackBar;
}

export interface AnswerInputImplementationProps {
    value: string;
    prompt: string;
    disabled?: boolean;
    onChange: (ans: string) => void;
    save: (ans: string) => void;
    showSnackBar: ShowSnackBar;
}

export class AnswerInput extends PureComponent<AnswerInputProps> {
    static defaultProps = {
        value: '',
        disabled: false,
        onChange: () => undefined,
        save: () => undefined,
        showSnackBar: () => undefined,
    };

    render(): ReactElement {
        const {type} = this.props;
        const props = this.getProps();
        if (type === '0') {
            return <_0_TrueFalse {...props} />;
        } else if (type === '1') {
            return <_1_MultipleChoice {...props} />;
        } else if (type === '2') {
            return <_2_Number {...props} />;
        } else if (type === '3') {
            return <_3_Expression {...props} />;
        } else if (type === '6') {
            return <_6_Vector {...props} />;
        } else if (type === '8') {
            return <_8_Matrix {...props} />;
        } else if (type === '9') {
            return <_9_Basis {...props} />;
        } else if (type == '10') {
            return <_10_WordInput {...props} />;
        } else {
            return (
                <Typography variant='body2' color='error'>
                    Invalid answer type
                </Typography>
            );
        }
    }

    getProps() {
        const {value, prompt, disabled, onChange, save, showSnackBar} = this.props;
        return {value, prompt, disabled, onChange, save, showSnackBar};
    }
}
