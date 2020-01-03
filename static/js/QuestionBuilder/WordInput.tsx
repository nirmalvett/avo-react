import * as React from 'react';
import {Typography, Button} from '@material-ui/core';
import Selectable from './Selectable';

export interface WordInputProps {
    onChange: (outputString: string) => any;
    children: string;
    color: {'200': string; '500': string};
}

export interface WordInputState {
    mode: 'word' | 'sentence';
    selected: Selectable[];
}

class WordInput extends React.Component<WordInputProps, WordInputState> {
    constructor(props: WordInputProps) {
        super(props);
        this.state = {
            mode: 'word',
            selected: [],
        };
    }

    render() {
        return (
            <div style={{margin: '5px'}}>
                <Typography
                    variant='body1'
                    style={{
                        border: '1px solid gray',
                        borderRadius: '5px',
                        padding: '5px',
                        marginBottom: '5px',
                    }}
                    onChange={() => this.props.onChange(this.state.selected.join('~~'))}
                >
                    {this.selectify(this.props.children)}
                </Typography>
                <Button variant='outlined' color='primary' onClick={this.toggleMode}>
                    {this.state.mode} mode
                </Button>
            </div>
        );
    }

    selectify = (input: string) => {
        const {mode} = this.state;
        const fields: string[] = mode === 'word' ? input.split(' ') : input.split(/(?<=\.) /g);
        const result: JSX.Element[] = fields.map((field: string) => {
            return (
                <Selectable color={this.props.color} add={this.add} remove={this.remove} type={mode}>
                    {field}
                </Selectable>
            );
        });
        return result;
    };

    toggleMode = () => {
        this.state.selected.forEach((element: Selectable) => {
            element.reset();
        });
        this.setState({
            mode: this.state.mode === 'word' ? 'sentence' : 'word',
            selected: [],
        });
    };

    add = (field: Selectable) => {
        if (!this.state.selected.includes(field)) {
            const copy = this.state.selected.slice();
            copy.push(field);
            this.setState({selected: copy}, this.sendResult);
        }
    };

    remove = (field: Selectable) => {
        if (this.state.selected.includes(field)) {
            const copy = this.state.selected.slice();
            const updated = copy.filter((element: Selectable) => element !== field);
            this.setState({selected: updated}, this.sendResult);
        }
    };

    sendResult = () => {
        const fields = this.state.selected.map((element: Selectable) => {
            return element.props.children;
        });
        this.props.onChange(fields.join('~~'));
    };
}

export default WordInput;