import * as React from 'react';
import Selectable from './Selectable';

export interface WordInputProps {
    onChange: (changedValue: string) => void;
    children: string;
    color: { '200': string; '500': string };
    value: string
    disabled?: boolean;
    mode: 'word' | 'sentence';
}
const SEPARATOR = '~~';
export default class WordInput extends React.PureComponent<WordInputProps> {
    constructor(props: WordInputProps) {
        super(props);
    }

    render() {
        return (
            <div style={{
                border: '1px solid gray',
                borderRadius: '5px',
                padding: '5px',
                margin: '5px',
            }}>
                {this.selectify(this.props.children)}
            </div>
        );
    }

    selectify = (input: string) => {
        const {mode, value, disabled} = this.props;
        const fields: string[] = mode === 'word' ? input.split(' ') : input.split(/(?<=\.) /g);
        return fields.map((field: string, i) => {
            const isSelected = Boolean(value.split(SEPARATOR).find(a => a === String(i)));
            const needsNewLines = field.includes('\n')
            if (needsNewLines) {
                const lines = field.split('\n')
                return (
                    <span>
                        {lines.map((line, i) => (
                            <span>
                                { i !== 0 && <br />}
                                <Selectable
                                    key={`${i}__${field}__selectable`}
                                    color={this.props.color}
                                    add={this.add}
                                    remove={this.remove}
                                    type={mode}
                                    position={i}
                                    selected={isSelected}
                                    disabled={disabled}
                                >   
                                    {line}
                                </Selectable>
                            </span>
                        ))}
                    </span>        
                ) 
            }
            return (
                <Selectable
                    key={`${i}__${field}__selectable`}
                    color={this.props.color}
                    add={this.add}
                    remove={this.remove}
                    type={mode}
                    position={i}
                    selected={isSelected}
                    disabled={disabled}
                >
                    {field}
                </Selectable>
            );
        });
    };


    add = (position: number) => {
        const {value} = this.props;
        const answers = value.split(SEPARATOR);
        const posString = String(position);
        // if the position isn't in the answer
        if (!answers.find(a => a === posString)) {
            // if the answer is the empty string send the position as the answer
            if (answers.length === 1 && answers[0] === "")
                this.props.onChange(posString);
            //  if there's at least one answer send the answers joined with the separator
            else if (answers.length >= 1) {
                answers.push(posString);
                this.props.onChange(answers.join(SEPARATOR));
            }
        }

    };

    remove = (position: number) => {
        const {value} = this.props;
        const oldAnswers = value.split(SEPARATOR);
        const posString = String(position);
        let answers = oldAnswers;
        // check if the answer contains the position we want to remove
        if (oldAnswers.find(a => a === posString)) {
            // if it does filter out the position
            answers = oldAnswers.filter(a => a !== posString);
            // the answer is now empty send an empty string
            if (answers.length === 0)
                this.props.onChange('');
            // if there's only one answer send just that answer
            else if (answers.length === 1)
                this.props.onChange(answers[0]);
            // if there's more than one answer join them together with the separator
            else if (answers.length > 1) {
                this.props.onChange(answers.join(SEPARATOR));
            }
        }
    }

}
