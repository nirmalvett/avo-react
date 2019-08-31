import React, {PureComponent} from 'react';
import {AnswerInputImplementationProps} from './AnswerInput';
import {getMathJax, validateNumber} from '../HelperFunctions/Utilities';
import {IconButton, TextField, Typography} from '@material-ui/core';
import {Add, DeleteOutlined} from '@material-ui/icons';

export class _6_Vector extends PureComponent<AnswerInputImplementationProps> {
    render() {
        const cells = (this.props.value || ',').split(',').map(x => x.trim());
        return (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {getMathJax(this.props.prompt)}
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <Typography variant='h5' style={{color: 'gray'}}>
                        (
                    </Typography>
                    {cells.map(this.renderCell)}
                    <Typography variant='h5' style={{color: 'gray'}}>
                        )
                    </Typography>
                </div>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <IconButton
                        style={{margin: '4px'}}
                        disabled={cells.length <= 2 || this.props.disabled}
                        onClick={this.deleteColumn}
                    >
                        <DeleteOutlined />
                    </IconButton>
                    <IconButton
                        style={{margin: '4px'}}
                        disabled={cells.length >= 5 || this.props.disabled}
                        onClick={this.addColumn}
                    >
                        <Add />
                    </IconButton>
                </div>
            </div>
        );
    }

    renderCell = (cell: string, index: number) => {
        const x = validateNumber(cell);
        return (
            <TextField
                style={{maxWidth: '12ch', margin: '0 4px'}}
                value={cell}
                onChange={e => this.onChange(e.target.value, index)}
                onBlur={() => this.props.save(this.props.value)}
                helperText={typeof x === 'string' ? x : undefined}
                error={typeof x === 'string'}
                disabled={this.props.disabled}
            />
        );
    };

    onChange(value: string, index: number) {
        const cells = this.props.value.split(',').map(x => x.trim());
        cells[index] = value;
        this.props.onChange(cells.join(','));
    }

    addColumn = () => {
        const cells = this.props.value.split(',').map(x => x.trim());
        cells.push('');
        this.props.save(cells.join(','));
    };

    deleteColumn = () => {
        const cells = this.props.value.split(',').map(x => x.trim());
        cells.pop();
        this.props.save(cells.join(','));
    };
}
